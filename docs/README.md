# Fashion Mirror - AI-Based Virtual Try-On System

## Project Overview

Fashion Mirror is an AI-powered virtual try-on system designed for clothing stores. The application allows users to upload their photo along with a clothing item image, and the AI generates a realistic visualization of how the clothing would look on them.

## Project Information

- **Project Title**: Fashion Mirror - AI-Based Virtual Try-On System for Clothing Stores
- **Institution**: Government College University, Faisalabad
- **Session**: 2024-2026
- **Supervisor**: Dr. M. Umer Sarwar

## Features

1. **User Image Upload**: Upload a clear photo of a person
2. **Clothing Image Upload**: Upload the clothing item to try on
3. **AI Virtual Try-On**: Generate realistic visualization using AI
4. **Multiple API Support**: Support for FASHN API, Replicate, and custom endpoints
5. **Download Results**: Save the generated try-on image

## System Modules

1. **Customer Image Capture Module**: Handles user photo uploads
2. **Background Removal Module**: Processes images for optimal results
3. **Clothing Overlay Module**: AI-based virtual try-on generation
4. **Manual Selection Interface**: User-friendly clothing selection
5. **Projection Module**: Display and download of results

## Technology Stack

- **Frontend/Backend**: Streamlit (Python Web Framework)
- **Image Processing**: Pillow (PIL)
- **API Integration**: Requests library
- **AI Models**: External virtual try-on APIs (FASHN, Replicate)

## Installation

### Prerequisites
- Python 3.11 or higher
- pip package manager

### Setup

1. Clone the repository or download the project files

2. Install dependencies:
```bash
pip install streamlit pillow requests
```

3. Run the application:
```bash
streamlit run app.py --server.port 5000
```

## Usage

1. **Configure API Key**: 
   - Open the sidebar
   - Select your API provider (FASHN API, Replicate, or Custom)
   - Enter your API key

2. **Upload Images**:
   - Upload a clear, front-facing photo of a person
   - Upload the clothing item image

3. **Generate Try-On**:
   - Click the "Generate Virtual Try-On" button
   - Wait for the AI to process the images

4. **View and Download**:
   - View the generated result
   - Download the image if satisfied

## API Configuration

### FASHN API
- Sign up at [FASHN AI](https://fashn.ai)
- Obtain your API key
- Select "FASHN API" in the provider dropdown

### Replicate
- Sign up at [Replicate](https://replicate.com)
- Generate an API token
- Select "Replicate" in the provider dropdown

### Custom API
- Select "Custom API" in the provider dropdown
- Enter your API key
- Enter the full API endpoint URL (must start with http:// or https://)
- Ensure your API follows the expected request/response format:

**Request Format (POST):**
```json
{
  "person_image": "data:image/png;base64,...",
  "clothing_image": "data:image/png;base64,..."
}
```

**Response Format:**
```json
{
  "output": "base64_encoded_result_image"
}
```
OR
```json
{
  "output": "https://url-to-result-image.png"
}
```

## Project Structure

```
fashion-mirror/
├── app.py                 # Main Streamlit application
├── utils/
│   ├── __init__.py       # Package initializer
│   ├── api_handler.py    # Virtual try-on API integration
│   └── image_utils.py    # Image processing utilities
├── docs/
│   ├── README.md         # This file
│   ├── SDLC.md          # Software Development Life Cycle
│   └── SRS.md           # Software Requirements Specification
└── .streamlit/
    └── config.toml      # Streamlit configuration
```

## Tips for Best Results

1. **Person Image**:
   - Use a clear, well-lit photo
   - Front-facing pose works best
   - Full upper body should be visible
   - Avoid complex backgrounds

2. **Clothing Image**:
   - Use images with plain/white backgrounds
   - Clothing should be clearly visible
   - Higher resolution produces better results

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API Key Error | Verify your API key is correct and active |
| Image Upload Failed | Ensure image is JPG, JPEG, or PNG format |
| Processing Timeout | Try with smaller images or check API status |
| Poor Results | Use higher quality, well-lit images |

## License

This project is developed for academic purposes as part of the Final Year Project at GC University, Faisalabad.

## Acknowledgments

- Dr. M. Umer Sarwar (Project Supervisor)
- Government College University, Faisalabad
- Virtual Try-On API Providers
