# ServerWatch - Linux Server Monitoring Platform

## Overview

ServerWatch is a comprehensive Linux server monitoring platform that tracks CPU and memory usage in real-time. The application features a credit-based system where users can monitor up to 5 servers for free, with additional servers available through earned credits or Pro subscriptions. The platform uses a React frontend with Express.js backend, PostgreSQL database, and includes a Python monitoring agent for data collection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Charts**: Chart.js for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with session-based authentication
- **Authentication**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication with secure cookies
- User profile management with credits tracking
- Pro subscription system with expiration dates

### Server Management
- API key-based server registration
- Real-time server status tracking (online/offline)
- Unique API keys for each monitored server
- IP address tracking and last seen timestamps

### Metrics Collection
- Python monitoring agent for Linux servers
- Hourly CPU and memory usage collection
- Historical data storage with time-series support
- Real-time dashboard updates

### Server Monitoring Model
- Up to 10 servers per user (free forever)
- No credit system or ads
- AI-powered chat support with Gemini
- Clean, attractive UI design

### Data Visualization
- Real-time CPU usage line charts
- Memory usage doughnut charts with breakdown
- Historical data with configurable time ranges
- Server status indicators and metrics cards

## Data Flow

1. **Server Registration**: Users create servers through the web interface, receiving unique API keys
2. **Data Collection**: Python agents on Linux servers collect metrics and POST to API endpoints
3. **Real-time Updates**: Frontend queries latest metrics and displays in dashboards
4. **Historical Analysis**: Users can view historical data across different time ranges
5. **Free Access**: Monitor up to 10 servers with AI-powered support

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Visualization**: Chart.js for metrics visualization
- **HTTP Client**: Fetch API with TanStack Query wrapper
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: Replit Auth with passport.js
- **Session Management**: express-session with PostgreSQL store
- **Validation**: Zod schema validation
- **Development**: tsx for TypeScript execution

### Monitoring Agent
- **System Metrics**: psutil for CPU and memory data
- **HTTP Client**: requests library for API communication
- **Scheduling**: schedule library for periodic execution
- **Logging**: Python logging with file and console output

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- tsx for backend TypeScript execution
- Database migrations via Drizzle Kit
- Environment variables for database and auth configuration

### Production Build
- Frontend: Vite production build to dist/public
- Backend: esbuild bundling to dist/index.js
- Static file serving through Express
- Node.js runtime with ES modules

### Database Strategy
- PostgreSQL schema defined in shared/schema.ts
- Drizzle migrations in migrations directory
- Connection string via DATABASE_URL environment variable
- Session table for authentication persistence

### Security Considerations
- Secure session cookies with httpOnly and secure flags
- API key authentication for metric submission
- CORS and input validation on all endpoints
- Environment-based configuration for sensitive data

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and scalable patterns for handling real-time monitoring data.

## Recent Enhancements (January 25, 2025)

### Enhanced Authentication System
- Added Gmail and GitHub OAuth login options with professional UI design
- Implemented OTP email verification system with 6-digit codes and 15-minute expiration
- Added comprehensive error handling and development mode OTP display for testing
- Enhanced user experience with step-by-step authentication flow and visual feedback
- Extended database schema to support multiple authentication methods

### Comprehensive SEO Optimization
- Implemented dynamic meta tag management system with SEOHead component
- Added structured data (Schema.org) for better search engine understanding
- Created comprehensive sitemap.xml with priority-based page indexing
- Added robots.txt with crawl optimization for major search engines (Google, Bing, DuckDuckGo, etc.)
- Enhanced landing page with targeted keywords and professional descriptions
- Added Open Graph and Twitter Card meta tags for social media sharing

### UI/UX Improvements
- Fixed server usage banner to show "Free tier: up to 5 servers" instead of confusing "5/5 servers used"
- Enhanced landing page with multiple authentication options and improved visual hierarchy
- Added professional login form with OAuth buttons and email verification flow
- Improved error handling and user feedback throughout the authentication process

### Technical Architecture Updates
- Extended PostgreSQL schema with additional authentication fields (githubId, googleId, emailVerified, etc.)
- Added OTP verification table with proper expiration and cleanup mechanisms
- Implemented comprehensive authentication storage methods with email lookup
- Added proper session management for multiple authentication providers
- Enhanced API routes with OTP sending and verification endpoints

### January 25, 2025 - Server Limits & AI Chat Support
- Changed from unlimited to 10-server limit per user for better resource management
- Removed all credit system and advertisement components from UI
- Added Gemini AI-powered chat widget for user support and help
- Enhanced dashboard UI with attractive gradient cards and improved visual design
- Implemented server limit validation in backend with proper error messages
- Added comprehensive AI assistant with ServerWatch-specific knowledge base