# Overview

CryptoPay is a full-stack cryptocurrency investment and earning platform built with React, Express, and PostgreSQL. The application offers users opportunities to earn through daily tasks, investments, and referral programs. Users receive a $100 trial balance upon registration and can participate in various earning activities including watching ads, completing tasks, and making investments with real money through JazzCash payment integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom crypto-themed color scheme and gradients
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC)
- **Session Management**: Express sessions stored in PostgreSQL with connect-pg-simple
- **File Uploads**: Multer middleware for handling image uploads with validation
- **API Design**: RESTful API with structured error handling and request logging

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle migrations with schema definitions in TypeScript
- **Key Tables**:
  - Users table with trial balances, investment tracking, and referral codes
  - Investments table with status tracking and file attachments
  - Withdrawals table with JazzCash integration
  - Daily tasks with completion tracking and reward systems
  - Sessions table for authentication persistence
- **Data Types**: Decimal precision for financial calculations, enum types for status fields

## Authentication & Authorization
- **Provider**: Replit Auth with OIDC for secure user authentication
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Role-based access with admin privileges for platform management
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

## Payment Integration
- **Payment Gateway**: JazzCash integration for Pakistani market
- **Supported Methods**: JazzCash wallet and card payments
- **File Upload**: Receipt verification system with image validation
- **Transaction Tracking**: Complete audit trail for investments and withdrawals

## Application Features
- **Trial System**: 3-day free trial with $100 virtual balance
- **Daily Tasks**: Gamified earning through ads, surveys, and activities
- **Investment Platform**: Real money investment opportunities with admin approval
- **Referral Program**: Multi-level referral system with unique codes
- **Admin Dashboard**: Complete platform management with user oversight

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit Auth service for user management and OIDC integration
- **Session Store**: PostgreSQL-backed session storage with connect-pg-simple

## Payment Services
- **JazzCash**: Primary payment gateway for Pakistani users supporting wallet and card transactions
- **File Storage**: Local file system for receipt uploads with future cloud storage capability

## Development Tools
- **Replit Integration**: Development environment with cartographer plugin and runtime error overlay
- **TypeScript**: Full-stack type safety with shared schema definitions
- **Drizzle Kit**: Database migration and schema management tools

## UI/UX Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Consistent icon library for the entire application
- **Class Variance Authority**: Type-safe styling variants for component systems
- **TailwindCSS**: Utility-first CSS framework with custom crypto theme

## Development Dependencies
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **Multer**: Multipart form handling for file uploads with validation