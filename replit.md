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
This feature provides a comprehensive Uniswap v4-style interface for adding liquidity to pools:

### Core Features
- **Token Pair Selection**: Dual token inputs with dropdown selectors and Max buttons for wallet balance
- **Fee Tiers**: Multiple fee tier options (0.01%, 0.05%, 0.30%, 1.00%) with descriptive labels
- **Hook Selection**: Optional hook integration including Mantua Intel Hook, Dynamic Fee Hook, TWAMM Hook, MEV Protection Hook, and custom hook support with address validation
- **Transaction Flow**: Multi-state transaction handling (idle → adding → processing → completed)

### Set Price Range
Advanced price range management for concentrated liquidity:
- **Full Range Mode**: Provides liquidity across all possible prices with simpler management
- **Custom Range Mode**: Concentrated liquidity within specific price bounds with Min/Max price inputs
- **Price Display**: Current price indicator with token pair badges and USD value conversion
- **Time Range Analysis**: Multiple time period selectors (1D, 1W, 1M, 1Y, All time) with active period highlighting

### APR & Rewards Display
Comprehensive rewards tracking and pool statistics:
- **Total APR Card**: Large display showing total APR with breakdown of Base APR (fee earnings) and Reward APR (incentive yields)
- **Rewards Distribution**: Progress visualization showing distributed vs. total rewards with pink/purple gradient bars, time period countdown, and campaign duration
- **Pool Stats**: TVL with change indicators, 24H volume with percentage changes, 24H fees collected, and pool balances with visual indicator bars

### Interactive Modals
- **Collect Fees Modal**: Displays earned fees for each token (ETH, cbBTC) with USD equivalent values and collection button
- **Remove Liquidity Modal**: Percentage-based withdrawal interface (25%, 50%, 75%, Max) with pool info display, position details, and review functionality

### Implementation Details
- **Component**: AddLiquidity page at `client/src/pages/AddLiquidity.tsx`
- **Modals**: CollectFeesModal and RemoveLiquidityModal at `client/src/components/liquidity/`
- **Styling**: Shadcn components with Mantua's purple/pink gradient theme, div containers with bg-card (no nested Cards)
- **State Management**: React hooks for form state, modal visibility, and price range configuration
- **Design System Compliance**: Built-in Button hover-elevate, consistent gap spacing, unique data-testid attributes
- **Mock Data**: Currently displays static placeholder data for APR, rewards, and statistics

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