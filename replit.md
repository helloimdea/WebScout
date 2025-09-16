# Web Proxy Application

## Overview

This is a web proxy application built with React and Express that allows users to load JavaScript-heavy websites through a secure proxy server. The application uses Puppeteer for browser automation to render dynamic content from sites like TikTok, YouTube, and other modern web applications that rely heavily on client-side JavaScript.

The proxy serves as a middleman between users and target websites, handling the complex rendering process on the server side and delivering the processed content to users. This approach enables access to sites that might otherwise be difficult to load due to CORS restrictions, JavaScript execution requirements, or network limitations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Bundler**: Vite for fast development and optimized production builds
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with a custom design system featuring dark-first aesthetics
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Proxy Engine**: Puppeteer for headless browser automation and JavaScript-heavy site rendering
- **Request Handling**: RESTful API endpoints for proxy operations
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless for scalable cloud hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Caching**: In-memory storage fallback with MemStorage class for development

### Authentication and Authorization
- **User Management**: Basic user schema with username/password authentication
- **Session Handling**: Server-side session management with PostgreSQL backing
- **Security**: CORS protection, input validation with Zod schemas

### Browser Automation Strategy
- **Engine**: Puppeteer with Chromium for reliable JavaScript execution
- **Configuration**: Headless mode with security-focused launch arguments
- **Resource Management**: Single browser instance with connection handling and automatic reconnection
- **Performance Optimization**: Disabled unnecessary features (GPU acceleration, extensions) for server environments

### Design System
- **Color Scheme**: Dark-first design with neutral base colors and blue accent
- **Typography**: Inter font family for optimal readability
- **Component Standards**: Consistent spacing using Tailwind utilities (2, 4, 6, 8, 12 unit scale)
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Chromium Browser**: System-level browser binary for Puppeteer automation

### Development Tools
- **Replit Integration**: Development environment with runtime error overlay and cartographer for debugging
- **Google Fonts**: CDN delivery for Inter and JetBrains Mono font families

### Key Libraries
- **UI Framework**: Radix UI for accessible component primitives
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Date Management**: date-fns for date manipulation and formatting
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography

### Browser Automation
- **Puppeteer**: Headless Chrome control for dynamic content rendering
- **System Chromium**: Pre-installed browser binary in Nix environment