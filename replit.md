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
The application includes comprehensive activity tracking for both user actions and AI agent operations:

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
- **Empty state handling**: Clear messaging when no agent activities exist

### Chat Integration
- **Activity feedback**: Automatic chat messages when activities complete
- **Quick navigation**: Chat messages include links to activity pages
- **Real-time updates**: Activity context monitors and updates chat in real-time
- **Message format**: "Activity Update: [action] added to history" with navigation link

### Implementation Details
- **ActivityContext**: Centralized state management for all activities
- **ActivityChatFeedback**: Component monitoring activity messages and injecting into chat
- **Auto-updates**: Charts and summaries update automatically as activities are added
- **Data persistence**: Activities stored with unique IDs, timestamps, and metadata

## Liquidity Pools Explorer
The application features a comprehensive liquidity pools explorer accessible via natural language chat commands:

### Pool Display Features
- **Pool Information**: Displays pool pair, protocol version, fee tier, TVL, APR, volume, and assigned hooks
- **Random Hook Assignment**: Each pool is randomly assigned a hook from the Mantua Hook Library (Mantua Intel Hook, Dynamic Fee Hook, TWAMM Hook, MEV Protection Hook, or no hook)
- **Uniswap-Style UI**: Clean table interface showing 10 mock pools with comprehensive data
- **Responsive Design**: Built with Shadcn Table components and purple theme styling
- **Data Columns**: Pool rank, pair name, protocol (v4), fee percentage, TVL, Pool APR, Hook assignment, 1-day volume, 30-day volume

### Natural Language Commands
The pools explorer supports intuitive chat-based triggers:
- **"pools"** or **"show me pools"**: Displays all available pools
- **"show me [TOKEN] pools"**: Filters pools containing the specified token (e.g., "show me ETH pools")
- **"show me [TOKEN1]/[TOKEN2] pools"**: Filters to specific trading pair (e.g., "show me ETH/USDC pools")

### Token Filtering
- **Dynamic Filtering**: Real-time filtering based on token symbols extracted from user commands
- **Case-Insensitive**: Accepts both uppercase and lowercase token symbols
- **Pair Support**: Handles both single-token and token-pair filtering
- **Normalized Display**: Tokens displayed in uppercase for consistency (ETH/USDC, WBTC/USDT, etc.)

### Mock Data Coverage
Pools include popular DeFi pairs: ETH/USDC, USDC/USDT, WBTC/USDT, cbBTC/ETH, EVA/USDT, ARB/ETH, OP/USDC, sUSD/DAI, PEPE/USDC, ETH/WBTC

### Implementation Details
- **Component**: PoolsList component located at `client/src/components/liquidity/PoolsList.tsx`
- **State Management**: Integrated into MainContent.tsx with pools mode similar to swap/liquidity modes
- **Detection Logic**: Custom regex-based command detection supporting both singular and plural forms
- **Hook Library Integration**: Uses shared `hookLibrary.ts` for consistent hook naming across features

## Add Liquidity Interface
The Add Liquidity component features a comprehensive Uniswap-style interface for providing liquidity to pools:

### Core Features
- **Token Pair Selection**: Dual token inputs with dropdown selectors and Max buttons for wallet balance
- **Fee Tiers**: Multiple fee tier options (0.01%, 0.05%, 0.30%, 1.00%) with descriptive labels
- **Hook Selection**: Optional hook integration including Mantua Intel Hook, Dynamic Fee Hook, TWAMM Hook, MEV Protection Hook, and custom hook support
- **Custom Hook Validation**: Address validation for custom hooks with real-time feedback
- **Transaction Flow**: Multi-state transaction handling (idle → adding → processing → completed)

### Set Price Range
Advanced price range management for concentrated liquidity:

**Full Range Mode**:
- Provides liquidity across all possible prices
- Simplifies position management
- Lower capital efficiency but broader market participation
- Default mode with descriptive explanation

**Custom Range Mode**:
- Concentrated liquidity within specific price bounds
- Enhanced capital efficiency and fee earnings
- Min/Max price inputs for precise range control
- Requires more active position management

**Price Display**:
- Current price indicator with real-time updates
- Token pair badges for visual clarity
- USD value conversion display
- Chart placeholder for future price visualization

**Time Range Analysis**:
- Multiple time period selectors (1D, 1W, 1M, 1Y, All time)
- Active period highlighting with primary color
- Reset functionality to return to default settings

### Implementation Details
- **Component**: AddLiquidity page located at `client/src/pages/AddLiquidity.tsx`
- **Styling**: Shadcn components with Mantua's purple/pink gradient accents
- **State Management**: React hooks for form state, transaction status, and price range configuration
- **Design System Compliance**: Uses built-in Button hover-elevate without custom hover states
- **Data Attributes**: Comprehensive data-testid attributes for automated testing

## Chat History Access Control
The application implements wallet-gated access for saved chat interactions:

- **Read-Only Mode**: When wallet is disconnected, users can VIEW their chat history but cannot INTERACT
- **Message Visibility**: Chat messages remain visible regardless of wallet connection status
- **Input Gating**: Chat input and action buttons are hidden when wallet is disconnected
- **Reconnection Prompt**: Message "Reconnect your wallet to interact with saved chats." displays when wallet is disconnected
- **Seamless Reconnection**: When wallet reconnects, full chat functionality is automatically restored
- **User Experience**: Allows users to review conversation history without requiring constant wallet connection, while preventing unauthorized interactions

## Blockchain Network Support
The application operates exclusively on Base Sepolia testnet:

- **Base Sepolia Testnet**: Primary and only supported testnet for development and testing (Chain ID: 84532)
- **Wagmi Integration**: Network configuration managed through wagmi with support for Coinbase Wallet and WalletConnect connectors
- **Block Explorer**: Base Sepolia Explorer for transaction verification
- **Thirdweb Integration**: Wallet connection and chain management handled via Thirdweb with client ID ad56c696e9e352f2d6beb550518a3023

The application automatically connects to Base Sepolia when a wallet is connected, with no chain switching required.

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