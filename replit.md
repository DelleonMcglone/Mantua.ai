# Overview

Mantua Protocol is a full-stack DeFi personal assistant application designed to simplify decentralized finance operations such as hooks, swaps, and programmable liquidity management. It features a chat-based interface inspired by leading crypto platforms, aiming to provide a professional yet user-friendly experience. The project focuses on enhancing user interaction with DeFi through intuitive design and advanced functionalities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
The frontend is a **React 18** application using **TypeScript**, built with **Vite**. It employs **Shadcn/ui** (based on Radix UI) for components and **Tailwind CSS** for styling, adhering to a purple-themed design system. **TanStack React Query** manages server state, and **Wouter** handles client-side routing. The application features a modular component structure, including a streamlined "Quick Actions Menu" with three options: Analyze, Swap, and Add Liquidity. Key pages include a marketing-focused Landing Page, the main DeFi application interface, an About Page detailing Mantua.AI's capabilities, and dedicated pages for User and Agent Activity tracking.

## Backend
The backend is a **Node.js/Express** server developed with **TypeScript**. It uses **Drizzle ORM** for PostgreSQL database interactions and **Express sessions** for session management. The API follows a RESTful design.

## Data Storage
**PostgreSQL** is the primary database, managed with **Drizzle ORM** and **Drizzle Kit** for schema migrations. The application uses **environment-aware storage**:
- **Production**: Uses PostgreSQL database with Drizzle ORM for persistent data storage
- **Development**: Uses in-memory storage (MemStorage) for faster development iterations
- **Automatic Switching**: Storage implementation automatically selects based on `NODE_ENV` environment variable

Database connection is configured in `server/db.ts` with proper error handling. The storage abstraction layer (`server/storage.ts`) implements both `DbStorage` (PostgreSQL) and `MemStorage` (in-memory) using a unified `IStorage` interface.

## Activity Tracking System
The application includes comprehensive tracking for both user and AI agent activities. This system provides real-time monitoring of transactions, portfolio metrics, performance, and activity logs. Chat integration delivers automatic updates and navigation links for completed activities, with data persisted via `ActivityContext`.

## Liquidity Pools Explorer
A Uniswap-style liquidity pools explorer allows users to view and filter mock DeFi pools. Pools display key metrics like TVL, APR, volume, and are randomly assigned hooks from the Mantua Hook Library. Users can interact with the explorer via natural language chat commands (e.g., "pools", "show me ETH pools").

## Analysis Mode
An interactive mode for real-time analysis of pools, tokens, and networks powered by CoinGecko API integration:

### Activation
- Accessible via the Quick Actions menu (+ button in chat input)
- Click "Analyze" to activate analysis mode
- Does not require wallet connection or API key

### Active Mode Features
- **Visual Indicators**: Primary-colored border around chat input, "Analyze" badge with hover-to-exit functionality
- **Dynamic Placeholder**: Input placeholder changes to "Ask me to analyze pools, tokens, or networks in real time..."
- **Quick Actions Menu**: Automatically closes when mode is activated
- **State Management**: Clears other active modes (swap, liquidity) when activated

### CoinGecko API Integration
Full-featured cryptocurrency data integration with **no API key required**:

#### Simple Price Queries
- Real-time token prices with market cap, 24h volume, and 24h price changes
- Supports multiple cryptocurrencies (BTC, ETH, USDC, etc.)
- Example queries: "eth price", "bitcoin price", "show me token prices"

#### Historical Market Data
- Fetch historical chart data with customizable time ranges (1-365 days)
- OHLC candlestick data for technical analysis
- Price, market cap, and volume history

#### On-Chain DEX Pool Analysis
Priority feature for Base network:
- **Search Pools**: Find liquidity pools across DEXes with natural language queries
- **Base Network Pools**: Get specific pool information on Base including reserves, volume, and pricing
- **Trending Pools**: Retrieve top trending pools with real-time volume and liquidity data
- **ETH/cbBTC Analysis**: Specialized endpoint for analyzing ETH/cbBTC pools on Base with detailed volume breakdowns (5min, 1h, 6h, 24h)
- Example queries: "search eth cbbtc pool", "show me trending pools on base", "analyze liquidity pools"

#### Supported Query Types
- **Pool Queries**: "eth cbbtc pool", "trending pools", "search for liquidity pools"
- **Price Queries**: "eth price", "bitcoin price", "usdc price"
- **Network Analysis**: "base network", "chain tvl", "protocol movers" (uses DefiLlama)

### API Endpoints
Backend exposes comprehensive CoinGecko endpoints:
- `GET /api/coingecko/prices` - Current token prices
- `GET /api/coingecko/markets` - Market data for multiple coins
- `GET /api/coingecko/chart/:coinId` - Historical chart data
- `GET /api/coingecko/pools/search` - Search liquidity pools
- `GET /api/coingecko/pools/base/:poolAddress` - Specific pool on Base
- `GET /api/coingecko/pools/base/trending` - Trending pools on Base
- `GET /api/coingecko/pools/eth-cbbtc` - ETH/cbBTC pools analysis

### Implementation
- **Frontend**: ChatInput at `client/src/components/ChatInput.tsx` handles mode activation/deactivation
- **Backend Service**: CoinGecko service at `server/services/coingecko.ts` with comprehensive TypeScript types
- **Analyze Integration**: Extended `server/services/analyze.ts` to detect and process pool/token queries
- **State Management**: Managed via `isAnalyzeModeActive` prop and callbacks in MainContent
- **Design Pattern**: Follows same pattern as Swap and Add Liquidity modes for consistency
- **Error Handling**: Robust handling for rate limits, network errors, and missing data
- **Optional API Key**: Works without authentication; set `COINGECKO_API_KEY` env var for higher rate limits (30 calls/min vs lower limits)

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

## Production Deployment
The application is production-ready with comprehensive deployment configurations:

### Server Configuration
- **Host Binding**: Server listens on `0.0.0.0` (all network interfaces) for Replit deployment compatibility
- **Port Configuration**: Uses environment variable `PORT` with fallback to `5000`
- **Environment Detection**: Automatically switches between development and production modes
- **Static File Serving**: Production builds served from `dist/public` directory

### Error Handling & Diagnostics
Enhanced startup logging and error handling for production troubleshooting:
- Detailed environment diagnostics on server startup
- Database connection status verification
- Comprehensive error logging with stack traces
- Graceful error handling for uncaught exceptions and promise rejections
- Server error event listeners with descriptive messages

### Build Process
- **Frontend Build**: `npm run build` - Vite bundles frontend to `dist/public`
- **Backend Build**: `npm run build` - ESBuild compiles TypeScript server to `dist/index.js`
- **Production Start**: `npm run start` - Runs compiled server with `NODE_ENV=production`
- **Database Migrations**: `npm run db:push` - Syncs Drizzle schema to PostgreSQL database

### Environment Variables
Required for production deployment:
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Replit)
- `PORT` - Server port (default: 5000, automatically set by Replit)
- `NODE_ENV` - Set to `production` for production builds

Optional environment variables:
- `COINGECKO_API_KEY` - For higher CoinGecko API rate limits (30 calls/min)
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID for wallet connections

### Deployment Checklist
1. ✅ Server binds to `0.0.0.0:5000`
2. ✅ PostgreSQL database configured and schema pushed
3. ✅ Production build tested successfully
4. ✅ Error handling and logging implemented
5. ✅ Static file serving configured
6. ✅ Environment variables properly set
7. ✅ Start command verified (`npm run start`)

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