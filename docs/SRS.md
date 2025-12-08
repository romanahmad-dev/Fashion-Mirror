# Software Requirements Specification (SRS)

## Fashion Mirror - AI-Based Virtual Try-On System for Clothing Stores

### Document Information
- **Version**: 1.0
- **Date**: 2024
- **Project**: Fashion Mirror
- **Institution**: Government College University, Faisalabad
- **Session**: 2024-2026
- **Supervisor**: Dr. M. Umer Sarwar

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a comprehensive description of the Fashion Mirror virtual try-on system. It outlines the functional and non-functional requirements, system features, and constraints for the project.

### 1.2 Scope
Fashion Mirror is a web-based application that enables users to virtually try on clothing items using AI technology. The system accepts user photos and clothing images, processes them through virtual try-on APIs, and displays realistic visualizations of how the clothing would appear on the user.

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| API | Application Programming Interface |
| AI | Artificial Intelligence |
| UI | User Interface |
| FYP | Final Year Project |
| SRS | Software Requirements Specification |
| PIL | Python Imaging Library |

### 1.4 References
- Streamlit Documentation
- FASHN AI API Documentation
- Replicate API Documentation
- Python Pillow Library Documentation

---

## 2. Overall Description

### 2.1 Product Perspective
Fashion Mirror is a standalone web application that integrates with external virtual try-on APIs. It serves as an intermediary between users and AI-powered clothing visualization services.

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│Fashion Mirror│────▶│ Try-On API   │
│          │◀────│  Application │◀────│ (FASHN, etc) │
└──────────┘     └──────────────┘     └──────────────┘
```

### 2.2 Product Functions
1. Accept and validate user images
2. Accept and validate clothing images
3. Configure API settings
4. Generate virtual try-on visualizations
5. Display and download results

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Skill |
|------------|-------------|-----------------|
| End User | Customers wanting to try clothes virtually | Low |
| Store Admin | Staff managing the system | Medium |
| Developer | Technical maintenance | High |

### 2.4 Operating Environment
- **Platform**: Web browser (Chrome, Firefox, Safari, Edge)
- **Server**: Python/Streamlit runtime
- **API Dependency**: Internet connection required
- **Minimum Resolution**: 1024x768 pixels

### 2.5 Design and Implementation Constraints
- Dependent on third-party virtual try-on APIs
- API rate limits may apply
- Image size limitations (max 4096x4096)
- Requires modern web browser with JavaScript

### 2.6 Assumptions and Dependencies
- Users have access to a web browser
- Users have API keys for try-on services
- Internet connection is available
- Images are in supported formats (JPG, PNG)

---

## 3. System Features

### 3.1 Feature 1: User Image Upload

#### 3.1.1 Description
Allows users to upload their photograph for virtual try-on.

#### 3.1.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR1.1 | System shall accept JPG, JPEG, PNG formats | High |
| FR1.2 | System shall validate image dimensions | High |
| FR1.3 | System shall display uploaded image preview | Medium |
| FR1.4 | System shall show validation errors | High |

### 3.2 Feature 2: Clothing Image Upload

#### 3.2.1 Description
Allows users to upload clothing item images.

#### 3.2.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2.1 | System shall accept clothing images | High |
| FR2.2 | System shall validate image format | High |
| FR2.3 | System shall display clothing preview | Medium |
| FR2.4 | System shall resize images if needed | Medium |

### 3.3 Feature 3: API Configuration

#### 3.3.1 Description
Allows users to configure virtual try-on API settings.

#### 3.3.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR3.1 | System shall allow API provider selection | High |
| FR3.2 | System shall securely store API key | High |
| FR3.3 | System shall validate API key format | Medium |
| FR3.4 | System shall display configuration status | Medium |

### 3.4 Feature 4: Virtual Try-On Generation

#### 3.4.1 Description
Generates virtual try-on visualization using AI.

#### 3.4.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR4.1 | System shall send images to API | High |
| FR4.2 | System shall show processing status | High |
| FR4.3 | System shall handle API errors | High |
| FR4.4 | System shall display result image | High |

### 3.5 Feature 5: Result Download

#### 3.5.1 Description
Allows users to download the generated try-on result.

#### 3.5.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR5.1 | System shall provide download button | High |
| FR5.2 | System shall save result as PNG | Medium |
| FR5.3 | System shall generate unique filename | Low |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Main Interface Layout
```
┌─────────────────────────────────────────────────────┐
│                    HEADER                           │
│              Fashion Mirror Logo                    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │           MAIN CONTENT                   │
│          │  ┌────────────┐  ┌────────────┐          │
│ - API    │  │  Person    │  │  Clothing  │          │
│   Config │  │  Upload    │  │  Upload    │          │
│          │  └────────────┘  └────────────┘          │
│ - Help   │                                          │
│          │     [ Generate Try-On Button ]           │
│          │                                          │
│          │         ┌──────────────┐                 │
│          │         │   RESULT     │                 │
│          │         └──────────────┘                 │
└──────────┴──────────────────────────────────────────┘
```

#### 4.1.2 UI Components
- File uploader for images
- Dropdown for API selection
- Password input for API key
- Button for generation
- Image display areas
- Download button

### 4.2 Hardware Interfaces
- Standard computer with web browser
- Minimum 4GB RAM recommended
- Internet connection

### 4.3 Software Interfaces

| Component | Interface Description |
|-----------|----------------------|
| FASHN API | REST API for virtual try-on |
| Replicate | Prediction API for AI models |
| Pillow | Image processing library |

### 4.4 Communication Interfaces
- HTTPS for API communication
- JSON data format
- Base64 image encoding

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR1.1 | Page load time | < 3 seconds |
| NFR1.2 | Image upload time | < 5 seconds |
| NFR1.3 | API response time | < 60 seconds |
| NFR1.4 | Concurrent users | 10+ |

### 5.2 Safety Requirements
- No storage of user images on server
- Temporary session-based data only
- Secure API key handling

### 5.3 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR3.1 | API keys stored in session state only |
| NFR3.2 | No plaintext password display |
| NFR3.3 | HTTPS for all API communication |
| NFR3.4 | Input validation for all uploads |

### 5.4 Software Quality Attributes

#### 5.4.1 Usability
- Intuitive interface requiring no training
- Clear error messages
- Helpful tooltips and instructions

#### 5.4.2 Reliability
- Graceful error handling
- API timeout management
- Session state persistence

#### 5.4.3 Maintainability
- Modular code architecture
- Documented functions
- Separation of concerns

#### 5.4.4 Portability
- Cross-browser compatibility
- Platform-independent Python code
- Containerizable deployment

---

## 6. System Modules

### 6.1 Module Overview

| Module | Description | Components |
|--------|-------------|------------|
| M1 | Customer Image Capture | Image upload, validation |
| M2 | Background Removal | Image preprocessing |
| M3 | Clothing Overlay | API integration |
| M4 | Manual Selection | UI controls |
| M5 | Projection | Result display |

### 6.2 Module Interactions

```
M1 (Image Capture) ──▶ M2 (Background Removal)
        │                       │
        └───────────┬───────────┘
                    ▼
            M3 (Clothing Overlay)
                    │
                    ▼
            M4 (Manual Selection)
                    │
                    ▼
            M5 (Projection/Display)
```

---

## 7. Use Cases

### 7.1 Use Case 1: Virtual Try-On

**Actor**: End User

**Preconditions**:
- User has valid API key
- User has person image
- User has clothing image

**Main Flow**:
1. User opens application
2. User enters API key in sidebar
3. User uploads person image
4. User uploads clothing image
5. User clicks "Generate" button
6. System processes images
7. System displays result
8. User downloads result (optional)

**Postconditions**:
- Virtual try-on result displayed
- Download option available

### 7.2 Use Case Diagram

```
                    ┌───────────────────┐
                    │   Fashion Mirror   │
                    │      System        │
                    └───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Configure API │   │  Upload       │   │  Download     │
│    Settings   │   │  Images       │   │  Result       │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────────────┐
                    │   End User    │
                    └───────────────┘
```

---

## 8. Data Requirements

### 8.1 Input Data

| Data Element | Type | Constraints |
|--------------|------|-------------|
| Person Image | File | JPG/JPEG/PNG, max 4096px |
| Clothing Image | File | JPG/JPEG/PNG, max 4096px |
| API Key | String | Provider-specific format |
| API Provider | Enum | FASHN/Replicate/Custom |

### 8.2 Output Data

| Data Element | Type | Format |
|--------------|------|--------|
| Result Image | File | PNG |
| Error Message | String | Text |
| Status | String | Success/Error |

---

## 9. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| Virtual Try-On | Technology enabling visualization of clothing on a person's image |
| Base64 | Binary-to-text encoding scheme |
| Streamlit | Python web framework for data applications |
| API | Set of protocols for building software applications |

### Appendix B: Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | 2024 | Initial SRS | FYP Team |

---

## 10. Approval

This Software Requirements Specification has been prepared as part of the Final Year Project for BS Software Engineering at Government College University, Faisalabad.

**Supervisor**: Dr. M. Umer Sarwar

**Session**: 2024-2026
