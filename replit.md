# Overview

Mantua Protocol is a full-stack DeFi personal assistant application designed to simplify decentralized finance operations such as hooks, swaps, and programmable liquidity management. It features a chat-based interface inspired by leading crypto platforms, aiming to provide a professional yet user-friendly experience. The project focuses on enhancing user interaction with DeFi through intuitive design and advanced functionalities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
The frontend is a **React 18** application using **TypeScript**, built with **Vite**. It employs **Shadcn/ui** (based on Radix UI) for components and **Tailwind CSS** for styling, adhering to a purple-themed design system. **TanStack React Query** manages server state, and **Wouter** handles client-side routing. The application features a modular component structure, including a streamlined "Quick Actions Menu" with options for Swap, Add Liquidity, Analyze, and Explore Agents. Key pages include a marketing-focused Landing Page, the main DeFi application interface, an About Page detailing Mantua.AI's capabilities, and dedicated pages for User and Agent Activity tracking.

## Backend
The backend is a **Node.js/Express** server developed with **TypeScript**. It uses **Drizzle ORM** for PostgreSQL database interactions and **Express sessions** for session management. The API follows a RESTful design.

## Data Storage
**PostgreSQL** is the primary database, managed with **Drizzle ORM** and **Drizzle Kit** for schema migrations. **Neon serverless PostgreSQL** is used for cloud deployment, with an in-memory fallback for development.

## Activity Tracking System
The application includes comprehensive tracking for both user and AI agent activities. This system provides real-time monitoring of transactions, portfolio metrics, performance, and activity logs. Chat integration delivers automatic updates and navigation links for completed activities, with data persisted via `ActivityContext`.

## Liquidity Pools Explorer
A Uniswap-style liquidity pools explorer allows users to view and filter mock DeFi pools. Pools display key metrics like TVL, APR, volume, and are randomly assigned hooks from the Mantua Hook Library. Users can interact with the explorer via natural language chat commands (e.g., "pools", "show me ETH pools").

## Add Liquidity Interface
This feature provides a detailed interface for adding liquidity, supporting token pair selection, multiple fee tiers, and optional hook integration (Mantua Intel, Dynamic Fee, TWAMM, MEV Protection, custom hooks). It includes advanced price range management (Full Range and Custom Range modes), comprehensive APR and rewards displays, and detailed pool statistics.

## Chat History Access Control
Chat history is wallet-gated: users can view past conversations when disconnected but require a connected wallet to interact or input new messages. A prompt guides users to reconnect their wallet for full functionality.

## Blockchain Network Support
The application exclusively supports the **Base Sepolia testnet** (Chain ID: 84532) for all blockchain interactions, managed via **wagmi** and **Thirdweb** for wallet connectivity.

## Development and Build System
The project utilizes **Vite** for frontend bundling, **ESBuild** for backend compilation, and **TypeScript** for type safety across the stack. It is optimized for deployment on Replit.

# External Dependencies

## UI and Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives.
- **Shadcn/ui**: Components built on Radix UI and Tailwind CSS.
- **Lucide React**: Icon library.
- **Class Variance Authority**: Type-safe component variant management.

## Database and ORM
- **Drizzle ORM**: Type-safe SQL query builder.
- **Neon Database**: Serverless PostgreSQL.
- **Connect PG Simple**: PostgreSQL session store.

## Development and Build Tools
- **Vite**: Frontend build tool.
- **TypeScript**: Static type checking.
- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS**: CSS processing.

## State Management and Data Fetching
- **TanStack React Query**: Server state management.
- **React Hook Form**: Form state management.
- **Zod**: Runtime schema validation.

## Routing and Navigation
- **Wouter**: Lightweight client-side routing.

## Utility Libraries
- **Date-fns**: Date manipulation.
- **CLSX**: Conditional CSS class names.
- **Nanoid**: Unique ID generation.