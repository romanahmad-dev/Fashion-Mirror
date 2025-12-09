"""
API handler for virtual try-on services.
Supports multiple providers: FASHN API, Replicate, and custom endpoints.
"""

import requests
import time
from PIL import Image
import io
import base64
from typing import Optional, Dict, Any


class VirtualTryOnAPI:
    """
    Handler for virtual try-on API services.
    """
    
    PROVIDERS = {
        "FASHN API": {
            "base_url": "https://api.fashn.ai/v1",
            "run_endpoint": "/run",
            "status_endpoint": "/status"
        },
        "Replicate": {
            "base_url": "https://api.replicate.com/v1",
            "run_endpoint": "/predictions"
        },
        "Custom API": {
            "base_url": "",
            "run_endpoint": "/tryon"
        }
    }
    
    def __init__(self, api_key: str, provider: str = "FASHN API", custom_url: Optional[str] = None):
        """
        Initialize the API handler.
        
        Args:
            api_key: API key for authentication
            provider: API provider name
            custom_url: Custom API URL (for Custom API provider)
        """
        self.api_key = api_key
        self.provider = provider
        self.custom_url = custom_url
        
        if provider in self.PROVIDERS:
            self.config = self.PROVIDERS[provider]
        else:
            self.config = self.PROVIDERS["Custom API"]
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string."""
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def _base64_to_image(self, base64_string: str) -> Image.Image:
        """Convert base64 string to PIL Image."""
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        buffer = io.BytesIO(image_data)
        
        return Image.open(buffer)
    
    def generate_tryon(self, person_image: Image.Image, clothing_image: Image.Image) -> Dict[str, Any]:
        """
        Generate virtual try-on using the configured API.
        
        Args:
            person_image: PIL Image of the person
            clothing_image: PIL Image of the clothing
        
        Returns:
            Dictionary with 'success', 'image' (if successful), or 'error' (if failed)
        """
        if self.provider == "FASHN API":
            return self._fashn_tryon(person_image, clothing_image)
        elif self.provider == "Replicate":
            return self._replicate_tryon(person_image, clothing_image)
        else:
            return self._custom_tryon(person_image, clothing_image)
    
    def _fashn_tryon(self, person_image: Image.Image, clothing_image: Image.Image) -> Dict[str, Any]:
        """
        Generate try-on using FASHN API.
        """
        try:
            person_b64 = self._image_to_base64(person_image)
            clothing_b64 = self._image_to_base64(clothing_image)
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model_image": f"data:image/png;base64,{person_b64}",
                "garment_image": f"data:image/png;base64,{clothing_b64}",
                "category": "tops"
            }
            
            run_url = f"{self.config['base_url']}{self.config['run_endpoint']}"
            response = requests.post(run_url, json=payload, headers=headers, timeout=60)
            
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"API request failed: {response.status_code} - {response.text}"
                }
            
            result = response.json()
            
            if "id" in result:
                return self._poll_fashn_status(result["id"], headers)
            elif "output" in result:
                if isinstance(result["output"], str) and result["output"].startswith("http"):
                    img_response = requests.get(result["output"], timeout=30)
                    if img_response.status_code == 200:
                        return {
                            "success": True,
                            "image": Image.open(io.BytesIO(img_response.content))
                        }
                elif isinstance(result["output"], str):
                    return {
                        "success": True,
                        "image": self._base64_to_image(result["output"])
                    }
            
            return {
                "success": False,
                "error": "Unexpected API response format"
            }
            
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "API request timed out. Please try again."
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}"
            }
    
    def _poll_fashn_status(self, prediction_id: str, headers: dict, max_attempts: int = 60) -> Dict[str, Any]:
        """
        Poll FASHN API for prediction status.
        """
        status_url = f"{self.config['base_url']}{self.config['status_endpoint']}/{prediction_id}"
        
        for _ in range(max_attempts):
            try:
                response = requests.get(status_url, headers=headers, timeout=30)
                
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Status check failed: {response.status_code}"
                    }
                
                result = response.json()
                status = result.get("status", "")
                
                if status == "completed":
                    output = result.get("output")
                    if output:
                        if isinstance(output, str) and output.startswith("http"):
                            img_response = requests.get(output, timeout=30)
                            if img_response.status_code == 200:
                                return {
                                    "success": True,
                                    "image": Image.open(io.BytesIO(img_response.content))
                                }
                        else:
                            return {
                                "success": True,
                                "image": self._base64_to_image(output)
                            }
                    return {
                        "success": False,
                        "error": "No output in completed prediction"
                    }
                
                elif status == "failed":
                    return {
                        "success": False,
                        "error": result.get("error", "Prediction failed")
                    }
                
                time.sleep(2)
                
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Error polling status: {str(e)}"
                }
        
        return {
            "success": False,
            "error": "Prediction timed out"
        }
    
    def _replicate_tryon(self, person_image: Image.Image, clothing_image: Image.Image) -> Dict[str, Any]:
        """
        Generate try-on using Replicate API.
        """
        try:
            person_b64 = self._image_to_base64(person_image)
            clothing_b64 = self._image_to_base64(clothing_image)
            
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "version": "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
                "input": {
                    "human_img": f"data:image/png;base64,{person_b64}",
                    "garm_img": f"data:image/png;base64,{clothing_b64}",
                    "garment_des": "clothing item"
                }
            }
            
            run_url = f"{self.config['base_url']}{self.config['run_endpoint']}"
            response = requests.post(run_url, json=payload, headers=headers, timeout=60)
            
            if response.status_code not in [200, 201]:
                return {
                    "success": False,
                    "error": f"API request failed: {response.status_code} - {response.text}"
                }
            
            result = response.json()
            
            if "urls" in result and "get" in result["urls"]:
                return self._poll_replicate_status(result["urls"]["get"], headers)
            elif "output" in result:
                output = result["output"]
                if isinstance(output, list) and len(output) > 0:
                    output = output[0]
                if isinstance(output, str) and output.startswith("http"):
                    img_response = requests.get(output, timeout=30)
                    if img_response.status_code == 200:
                        return {
                            "success": True,
                            "image": Image.open(io.BytesIO(img_response.content))
                        }
            
            return {
                "success": False,
                "error": "Unexpected API response format"
            }
            
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "API request timed out. Please try again."
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}"
            }
    
    def _poll_replicate_status(self, status_url: str, headers: dict, max_attempts: int = 60) -> Dict[str, Any]:
        """
        Poll Replicate API for prediction status.
        """
        for _ in range(max_attempts):
            try:
                response = requests.get(status_url, headers=headers, timeout=30)
                
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Status check failed: {response.status_code}"
                    }
                
                result = response.json()
                status = result.get("status", "")
                
                if status == "succeeded":
                    output = result.get("output")
                    if output:
                        if isinstance(output, list) and len(output) > 0:
                            output = output[0]
                        if isinstance(output, str) and output.startswith("http"):
                            img_response = requests.get(output, timeout=30)
                            if img_response.status_code == 200:
                                return {
                                    "success": True,
                                    "image": Image.open(io.BytesIO(img_response.content))
                                }
                    return {
                        "success": False,
                        "error": "No output in completed prediction"
                    }
                
                elif status == "failed":
                    return {
                        "success": False,
                        "error": result.get("error", "Prediction failed")
                    }
                
                time.sleep(2)
                
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Error polling status: {str(e)}"
                }
        
        return {
            "success": False,
            "error": "Prediction timed out"
        }
    
    def _custom_tryon(self, person_image: Image.Image, clothing_image: Image.Image) -> Dict[str, Any]:
        """
        Generate try-on using custom API endpoint.
        """
        if not self.custom_url:
            return {
                "success": False,
                "error": "Custom API URL not configured"
            }
        
        try:
            person_b64 = self._image_to_base64(person_image)
            clothing_b64 = self._image_to_base64(clothing_image)
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "person_image": f"data:image/png;base64,{person_b64}",
                "clothing_image": f"data:image/png;base64,{clothing_b64}"
            }
            
            response = requests.post(self.custom_url, json=payload, headers=headers, timeout=120)
            
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"API request failed: {response.status_code} - {response.text}"
                }
            
            result = response.json()
            
            if "output" in result or "image" in result or "result" in result:
                output = result.get("output") or result.get("image") or result.get("result")
                if isinstance(output, str):
                    if output.startswith("http"):
                        img_response = requests.get(output, timeout=30)
                        if img_response.status_code == 200:
                            return {
                                "success": True,
                                "image": Image.open(io.BytesIO(img_response.content))
                            }
                    else:
                        return {
                            "success": True,
                            "image": self._base64_to_image(output)
                        }
            
            return {
                "success": False,
                "error": "Unexpected API response format"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}"
            }
