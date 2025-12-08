# Software Development Life Cycle (SDLC)

## Fashion Mirror - AI-Based Virtual Try-On System

### Project Information
- **Project Title**: Fashion Mirror - AI-Based Virtual Try-On System for Clothing Stores
- **Institution**: Government College University, Faisalabad
- **Session**: 2024-2026
- **Supervisor**: Dr. M. Umer Sarwar

---

## 1. Planning Phase

### 1.1 Project Initiation
The Fashion Mirror project was initiated to address the growing need for virtual try-on solutions in the retail clothing industry. With the rise of online shopping, customers need a way to visualize how clothing items would look on them before making a purchase.

### 1.2 Objectives
- Develop a web-based virtual try-on application
- Integrate AI-powered clothing overlay technology
- Create an intuitive user interface
- Support multiple virtual try-on API providers
- Enable result download functionality

### 1.3 Scope
**In Scope:**
- Web application development using Streamlit
- User image upload functionality
- Clothing image upload functionality
- API integration for virtual try-on
- Result visualization and download

**Out of Scope:**
- Mobile application development
- Real-time video try-on
- Physical store integration
- Payment processing

### 1.4 Timeline
| Phase | Duration | Activities |
|-------|----------|------------|
| Planning | 2 weeks | Requirements gathering, feasibility study |
| Analysis | 2 weeks | System analysis, API research |
| Design | 3 weeks | UI/UX design, architecture design |
| Development | 6 weeks | Coding, integration |
| Testing | 2 weeks | Unit testing, integration testing |
| Deployment | 1 week | Deployment, documentation |

---

## 2. Analysis Phase

### 2.1 Requirements Analysis

#### Functional Requirements
1. User shall be able to upload a person image
2. User shall be able to upload a clothing image
3. System shall integrate with virtual try-on APIs
4. System shall display the try-on result
5. User shall be able to download the result
6. User shall be able to configure API settings

#### Non-Functional Requirements
1. Response time: < 30 seconds for try-on generation
2. Supported image formats: JPG, JPEG, PNG
3. Maximum image size: 4096x4096 pixels
4. Browser compatibility: Chrome, Firefox, Safari, Edge

### 2.2 Feasibility Study

#### Technical Feasibility
- Streamlit provides rapid web development capabilities
- Multiple virtual try-on APIs available (FASHN, Replicate)
- Python ecosystem supports image processing needs

#### Economic Feasibility
- Open-source framework (Streamlit) - No licensing cost
- API costs depend on usage volume
- Minimal infrastructure requirements

#### Operational Feasibility
- Simple user interface requires minimal training
- Web-based access from any device
- Easy maintenance and updates

---

## 3. Design Phase

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│                  (Streamlit Frontend)                │
├─────────────────────────────────────────────────────┤
│              Application Logic Layer                 │
│  ┌───────────────┐  ┌───────────────────────────┐   │
│  │ Image Utils   │  │     API Handler           │   │
│  │ - Resize      │  │ - FASHN API               │   │
│  │ - Validate    │  │ - Replicate               │   │
│  │ - Convert     │  │ - Custom API              │   │
│  └───────────────┘  └───────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│              External Services Layer                 │
│  ┌───────────────┐  ┌───────────────────────────┐   │
│  │ FASHN AI API  │  │    Replicate API          │   │
│  └───────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Module Design

#### Module 1: Customer Image Capture
- Accepts user image uploads
- Validates image format and size
- Prepares image for processing

#### Module 2: Clothing Image Handler
- Accepts clothing item images
- Validates and processes images
- Extracts clothing for overlay

#### Module 3: API Integration
- Connects to virtual try-on APIs
- Handles authentication
- Manages request/response cycle

#### Module 4: Result Display
- Renders try-on results
- Provides download functionality
- Handles error display

### 3.3 User Interface Design

The UI follows a clean, intuitive layout:
1. Header with project branding
2. Sidebar for configuration
3. Two-column layout for image uploads
4. Central generation button
5. Result display area

---

## 4. Development Phase

### 4.1 Technology Stack
- **Framework**: Streamlit 1.52+
- **Language**: Python 3.11
- **Image Processing**: Pillow (PIL)
- **HTTP Client**: Requests
- **Deployment**: Replit

### 4.2 Development Methodology
Agile development with iterative sprints:
- Sprint 1: Basic UI setup
- Sprint 2: Image handling
- Sprint 3: API integration
- Sprint 4: Result handling
- Sprint 5: Testing and refinement

### 4.3 Code Organization
```
app.py                    # Main application entry point
utils/
  __init__.py            # Package initializer
  api_handler.py         # API integration logic
  image_utils.py         # Image processing functions
docs/
  README.md              # User documentation
  SDLC.md               # This document
  SRS.md                # Requirements specification
```

---

## 5. Testing Phase

### 5.1 Testing Strategy

| Test Type | Description | Tools |
|-----------|-------------|-------|
| Unit Testing | Test individual functions | pytest |
| Integration Testing | Test API integration | Manual testing |
| UI Testing | Test user interface | Browser testing |
| User Acceptance | Validate requirements | User feedback |

### 5.2 Test Cases

| ID | Description | Expected Result |
|----|-------------|-----------------|
| TC01 | Upload valid person image | Image displayed |
| TC02 | Upload invalid format | Error message shown |
| TC03 | Generate try-on | Result image displayed |
| TC04 | Download result | File downloaded |
| TC05 | Invalid API key | Error message shown |

---

## 6. Deployment Phase

### 6.1 Deployment Environment
- **Platform**: Replit
- **Server**: Streamlit built-in server
- **Port**: 5000

### 6.2 Deployment Steps
1. Configure environment variables
2. Install dependencies
3. Run application server
4. Test deployment
5. Monitor performance

### 6.3 Post-Deployment Activities
- Monitor application logs
- Gather user feedback
- Plan future enhancements

---

## 7. Maintenance Phase

### 7.1 Maintenance Activities
- Bug fixes and patches
- API version updates
- Feature enhancements
- Security updates

### 7.2 Future Enhancements
- Add more API providers
- Implement batch processing
- Add user accounts
- Store try-on history

---

## Conclusion

The Fashion Mirror project follows a structured SDLC approach to ensure systematic development and delivery of a quality virtual try-on system. The project demonstrates practical application of software engineering principles in developing AI-integrated web applications.
