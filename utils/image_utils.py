"""
Image processing utilities for Fashion Mirror virtual try-on system.
"""

from PIL import Image
import io
import base64


def resize_image(image: Image.Image, max_size: int = 1024) -> Image.Image:
    """
    Resize an image while maintaining aspect ratio.
    
    Args:
        image: PIL Image object
        max_size: Maximum dimension (width or height)
    
    Returns:
        Resized PIL Image
    """
    width, height = image.size
    
    if width <= max_size and height <= max_size:
        return image
    
    if width > height:
        new_width = max_size
        new_height = int(height * (max_size / width))
    else:
        new_height = max_size
        new_width = int(width * (max_size / height))
    
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """
    Convert a PIL Image to base64 encoded string.
    
    Args:
        image: PIL Image object
        format: Image format (PNG, JPEG, etc.)
    
    Returns:
        Base64 encoded string
    """
    if image.mode == 'RGBA' and format.upper() == 'JPEG':
        image = image.convert('RGB')
    
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def base64_to_image(base64_string: str) -> Image.Image:
    """
    Convert a base64 encoded string to PIL Image.
    
    Args:
        base64_string: Base64 encoded image string
    
    Returns:
        PIL Image object
    """
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    buffer = io.BytesIO(image_data)
    
    return Image.open(buffer)


def validate_image(image: Image.Image, min_size: int = 100, max_size: int = 4096) -> tuple:
    """
    Validate an image meets requirements.
    
    Args:
        image: PIL Image object
        min_size: Minimum dimension required
        max_size: Maximum dimension allowed
    
    Returns:
        Tuple of (is_valid, message)
    """
    width, height = image.size
    
    if width < min_size or height < min_size:
        return False, f"Image too small. Minimum dimension is {min_size}px."
    
    if width > max_size or height > max_size:
        return False, f"Image too large. Maximum dimension is {max_size}px."
    
    if image.mode not in ['RGB', 'RGBA', 'L']:
        return False, "Unsupported image mode. Please use RGB or RGBA images."
    
    return True, "Image is valid."


def convert_to_rgb(image: Image.Image) -> Image.Image:
    """
    Convert image to RGB mode if necessary.
    
    Args:
        image: PIL Image object
    
    Returns:
        RGB PIL Image
    """
    if image.mode == 'RGBA':
        background = Image.new('RGB', image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])
        return background
    elif image.mode != 'RGB':
        return image.convert('RGB')
    return image


def get_image_dimensions(image: Image.Image) -> dict:
    """
    Get image dimensions and metadata.
    
    Args:
        image: PIL Image object
    
    Returns:
        Dictionary with image information
    """
    return {
        'width': image.size[0],
        'height': image.size[1],
        'mode': image.mode,
        'format': image.format,
        'aspect_ratio': round(image.size[0] / image.size[1], 2)
    }
