# MIRROR - Virtual Try-On Application

## Overview

MIRROR is an AI-powered virtual clothing try-on application that allows users to upload a photo of themselves, select a garment image, and see how the clothing would look on them using the FASHN AI API. The application features a luxury-focused design with a monochromatic color scheme and smooth animations.

The app follows a typical SaaS pattern with user authentication, a dashboard to view past try-ons, and a wizard-style interface for creating new virtual try-on requests.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom luxury-themed design tokens (monochromatic palette, sharp edges)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **File Uploads**: react-dropzone for drag-and-drop image uploads, converted to Base64 before sending

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful endpoints defined in shared route contracts
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: express-session with PostgreSQL-backed session store (connect-pg-simple)
- **File Storage**: Local disk storage via Multer for uploaded files

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Validation**: Zod with drizzle-zod integration for runtime validation
- **Tables**:
  - `users` - User profiles from Replit Auth
  - `sessions` - Session storage for authentication
  - `try_ons` - Virtual try-on requests with status tracking

### AI Integration
- **Provider**: FASHN AI API (https://api.fashn.ai)
- **Model**: fashn-tryon-v1
- **Pattern**: Async job submission with polling for status
- **Flow**: Submit try-on request → receive prediction ID → poll for completion → retrieve result image

### Authentication Flow
- Uses Replit's OpenID Connect provider
- Sessions stored in PostgreSQL for persistence across restarts
- Protected routes check authentication via `isAuthenticated` middleware
- User data upserted on login with profile information from OIDC claims

### Key Design Decisions

1. **Shared Route Contracts**: API routes defined in `shared/routes.ts` with Zod schemas ensure type safety across client and server boundaries

2. **Base64 Image Handling**: Images converted to Base64 data URIs on client before submission, avoiding need for separate upload endpoints

3. **Polling Architecture**: Try-on status checked via polling rather than WebSockets for simplicity and reliability with external AI API

4. **Monorepo Structure**: Client (`client/`), server (`server/`), and shared (`shared/`) code colocated with path aliases for clean imports

## External Dependencies

### AI Services
- **FASHN AI API**: Virtual try-on processing
  - Requires `FASHN_API_KEY` environment variable
  - Endpoints: `/v1/run` (submit), `/v1/status/:id` (poll)

### Database
- **PostgreSQL**: Primary data store
  - Requires `DATABASE_URL` environment variable
  - Managed via Drizzle Kit migrations (`npm run db:push`)

### Authentication
- **Replit Auth**: OpenID Connect provider
  - Requires `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET` environment variables
  - Handles user identity and session management

### Build Tools
- **Vite**: Frontend bundling with HMR in development
- **esbuild**: Server bundling for production builds
- **TypeScript**: Type checking across the codebase