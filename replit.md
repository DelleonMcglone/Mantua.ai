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
- **Routing**: Wouter for lightweight client-side routing with landing page, main application, and about page routes
- **Component Structure**: Modular components organized by feature (Header, Sidebar, MainContent, ChatInput, ActionButtons, Landing, About)
- **Quick Actions Menu**: Streamlined action menu with 4 options - Swap, Add Liquidity, Analyze, and Explore Agents

The design system follows a cohesive purple color scheme (270° 85% 60% primary) with Inter font family and responsive layout patterns.

## Application Structure
The application features a multi-page architecture:

- **Landing Page** (`/`): Marketing-focused entry point with hero section, feature descriptions, and "Launch App" call-to-action
- **Main Application** (`/app`): Full DeFi assistant interface with sidebar navigation, chat functionality, and action buttons
- **About Page** (`/about`): Scrollable markdown-style page with comprehensive information about Mantua.AI capabilities, example actions, and hooks overview
- **User Activity Page** (`/user-activity`): Comprehensive activity tracking dashboard showing portfolio value, transactions, and swap history
- **Agent Activity Page** (`/agent-activity`): AI agent monitoring interface displaying managed value, performance metrics, and automated trading activity
- **Navigation Flow**: Landing page → Launch App button → Main application interface with sidebar access to activity pages

The landing page includes:
- Header with social media icons (Discord, X, Farcaster), About link, theme toggle, and Launch App button
- Hero section with main value proposition
- App preview mockup showing the main interface
- Consistent purple branding and theme-aware logo switching

The About page includes:
- Detailed introduction to Mantua.AI as a programmable liquidity layer
- Example Actions section covering: Swap, Deploy, Understand, Interact, Explore, Research
- Hooks Overview section explaining dynamic fees, TWAP, MEV protection, and custom hooks

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

## Activity Tracking System
The application includes comprehensive activity tracking for both user actions and AI agent operations with dual-logging integration:

### User Activity
- **Real-time tracking**: Automatically logs all swap and liquidity transactions
- **Portfolio metrics**: Total value, gains/losses, transaction count
- **Visual analytics**: Portfolio value overtime chart with purple gradient styling
- **Activity history**: Filterable table showing swaps and liquidity pool interactions
- **Status tracking**: Completed, pending, and failed transaction states

### Agent Activity
- **Performance monitoring**: Tracks cumulative returns and commands processed
- **Value management**: Displays total value managed by AI agents
- **Activity logging**: Records all agent-initiated transactions
- **Agent controls**: Pause/resume agent activity functionality
- **Simulation testing**: "Simulate Agent Swap" button for testing dual-logging
- **Empty state handling**: Clear messaging when no agent activities exist

### Dual-Logging Integration
- **Synchronized updates**: Agent actions automatically create entries in both agent and user activity tables
- **Value synchronization**: Total value managed (agent) equals total portfolio value (user) when all swaps are agent-driven
- **Transaction mirroring**: Agent swaps appear in both dashboards with matching values and metadata
- **Distinct feedback**: Chat messages distinguish between user actions ("View in User Activity") and agent actions ("View in Agent Activity")
- **Unified metrics**: Charts and summaries update across both views when agent executes transactions

### Chat Integration
- **Type-aware feedback**: Automatic chat messages distinguish user vs agent actions with appropriate links
- **Quick navigation**: Chat messages include links to respective activity pages based on action type
- **Real-time updates**: Activity context monitors and updates chat in real-time
- **Deduplication handling**: Repeated identical messages properly clear cache to allow consistent feedback
- **Message format**: "[User/Agent] executed: [action] ([status])" with type-specific navigation links

### Implementation Details
- **ActivityContext**: Centralized state management with dual-logging logic for all activities
- **localStorage persistence**: Activities persist across navigation with error-resilient hydration
- **ActivityChatFeedback**: Component monitoring activity messages with cache management for repeated actions
- **ActivityMessage interface**: Includes type (user/agent) and link properties for proper routing
- **Auto-updates**: Charts and summaries update automatically across both dashboards
- **Data persistence**: Activities stored with unique IDs, timestamps, metadata, and localStorage backup

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