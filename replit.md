# Overview

Mantua Protocol is a modern DeFi (Decentralized Finance) personal assistant application built as a full-stack web application. The platform serves as a user-friendly interface for DeFi operations including hooks, swaps, and programmable liquidity management. The application features a clean, professional design inspired by modern crypto platforms like Uniswap and Aave, with a chat-based interaction model for enhanced user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using **React 18** with **TypeScript** and follows a component-based architecture:

- **Framework**: Vite-powered React application with TypeScript for type safety
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system implementing purple-themed color palette
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular components organized by feature (Header, Sidebar, MainContent, ChatInput, ActionButtons)

The design system follows a cohesive purple color scheme (270° 85% 60% primary) with Inter font family and responsive layout patterns.

## Backend Architecture
The backend uses a **Node.js/Express** server architecture:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database Integration**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Express sessions with PostgreSQL session store
- **API Structure**: RESTful API design with /api prefix routing
- **Storage Layer**: Abstracted storage interface supporting both memory and database implementations

## Data Storage Solutions
**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Fallback**: In-memory storage implementation for development/testing

Current schema includes basic user management with username/password authentication.

## Authentication and Authorization
Basic authentication structure is prepared but not fully implemented:
- User schema with username/password fields
- Password hashing and validation ready for implementation
- Session-based authentication using express-session
- Storage abstraction supports user creation and retrieval operations

## Development and Build System
**Build Pipeline**: 
- Vite for frontend bundling with React plugin
- ESBuild for backend compilation
- TypeScript compilation with strict mode enabled
- Path aliases configured for clean imports (@/, @shared/)

**Development Environment**:
- Hot module replacement via Vite
- Concurrent frontend/backend development
- Replit-specific optimizations and error handling

# External Dependencies

## UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Shadcn/ui**: Pre-built components using Radix UI and Tailwind CSS
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

## Database and ORM
- **Drizzle ORM**: Type-safe SQL query builder and ORM
- **Neon Database**: Serverless PostgreSQL database provider
- **Connect PG Simple**: PostgreSQL session store for Express

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer

## State Management and Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema validation

## Routing and Navigation
- **Wouter**: Lightweight client-side routing library

## Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **CLSX**: Conditional CSS class name utility
- **Nanoid**: Unique ID generation

The application is designed to be deployed on Replit with specific optimizations for the platform's development environment.