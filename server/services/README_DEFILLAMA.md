# DeFiLlama Service Integration

Complete TypeScript service for integrating DeFiLlama API into Mantua.AI.

## Quick Start

```typescript
import {
  getCurrentPrices,
  getYieldPools,
  getTrendingPools,
  searchPoolsByTokens,
  getProtocols,
  getChains
} from './defillama';

// Get current token prices
const prices = await getCurrentPrices([
  "coingecko:ethereum",
  "coingecko:bitcoin",
  "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
]);

console.log(prices.coins);
// {
//   "coingecko:ethereum": {
//     price: 3200,
//     symbol: "ETH",
//     decimals: 18,
//     timestamp: 1699564800,
//     confidence: 0.99
//   }
// }

// Search for ETH/BTC pools on Base
const pools = await searchPoolsByTokens("ETH", "BTC", "Base");
console.log(pools[0]);
// {
//   chain: "Base",
//   project: "uniswap-v3",
//   symbol: "ETH-WBTC",
//   tvlUsd: 5000000,
//   apy: 12.5,
//   volumeUsd1d: 1000000
// }

// Get top yield pools
const highYield = await getTrendingPools("Base", "apy", 5);
console.log(highYield[0].apy); // 45.2%
```

## API Functions

### Token Prices

#### `getCurrentPrices(coins: string[])`
Get current prices for multiple tokens.

**Parameters:**
- `coins`: Array of token identifiers in format:
  - `coingecko:{id}` - e.g., `coingecko:ethereum`
  - `{chain}:{address}` - e.g., `ethereum:0xa0b8...`

**Returns:** `TokenPricesResponse`

**Example:**
```typescript
const prices = await getCurrentPrices([
  "coingecko:ethereum",
  "base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" // USDC on Base
]);
```

#### `getHistoricalPrices(timestamp: number, coins: string[])`
Get token prices at a specific point in time.

**Parameters:**
- `timestamp`: Unix timestamp in seconds
- `coins`: Array of token identifiers

**Example:**
```typescript
const yesterday = Math.floor(Date.now() / 1000) - 86400;
const historicalPrices = await getHistoricalPrices(yesterday, [
  "coingecko:ethereum"
]);
```

### DEX Data

#### `getAllDexVolumes()`
Get trading volumes for all DEXes across all chains.

**Returns:** Object with volume charts and protocol breakdown

**Example:**
```typescript
const dexData = await getAllDexVolumes();
console.log(dexData.protocols); // Array of DEXes with volumes
```

#### `getDexVolumesByChain(chain: string)`
Get DEX volumes for a specific blockchain.

**Parameters:**
- `chain`: Chain name (e.g., "Ethereum", "Base", "Arbitrum")

**Example:**
```typescript
const baseVolumes = await getDexVolumesByChain("Base");
```

#### `getDexSummary(dex: string)`
Get summary stats for a specific DEX.

**Parameters:**
- `dex`: DEX identifier (e.g., "uniswap", "curve")

**Example:**
```typescript
const uniswapStats = await getDexSummary("uniswap");
console.log(uniswapStats.totalVolume);
console.log(uniswapStats.change_7d); // 7-day change %
```

### Yield Pools

#### `getYieldPools(chain?: string)`
Get all yield farming pools, optionally filtered by chain.

**Parameters:**
- `chain` (optional): Filter by blockchain (e.g., "Base", "Ethereum")

**Returns:** `{ data: YieldPool[] }`

**Example:**
```typescript
// Get all pools
const allPools = await getYieldPools();

// Get Base pools only
const basePools = await getYieldPools("Base");

// Filter high-APY stablecoin pools
const stableHighYield = basePools.data.filter(
  pool => pool.stablecoin && pool.apy > 10
);
```

#### `getTrendingPools(chain: string, sortBy: "apy" | "tvl" | "volume", limit: number)`
Get top pools sorted by specific criteria.

**Parameters:**
- `chain`: Blockchain name
- `sortBy`: Sort metric ("apy", "tvl", or "volume")
- `limit`: Number of pools to return

**Example:**
```typescript
// Top 10 pools by TVL on Base
const topByTvl = await getTrendingPools("Base", "tvl", 10);

// Highest APY pools
const highestApy = await getTrendingPools("Ethereum", "apy", 5);

// Most active pools by volume
const mostActive = await getTrendingPools("Arbitrum", "volume", 10);
```

#### `searchPoolsByTokens(token1: string, token2: string, chain?: string)`
Find liquidity pools containing specific token pairs.

**Parameters:**
- `token1`: First token symbol (e.g., "ETH")
- `token2`: Second token symbol (e.g., "USDC")
- `chain` (optional): Filter by blockchain

**Returns:** Array of matching pools sorted by TVL

**Example:**
```typescript
// Find ETH/USDC pools on Base
const ethUsdcPools = await searchPoolsByTokens("ETH", "USDC", "Base");

// Find BTC/ETH pools across all chains
const btcEthPools = await searchPoolsByTokens("BTC", "ETH");
```

### Protocols & TVL

#### `getProtocols()`
Get all DeFi protocols with TVL and metadata.

**Returns:** Array of `Protocol` objects

**Example:**
```typescript
const protocols = await getProtocols();

// Find top 10 by TVL
const top10 = protocols
  .sort((a, b) => b.tvl - a.tvl)
  .slice(0, 10);

// Filter by category
const lendingProtocols = protocols.filter(
  p => p.category === "Lending"
);
```

#### `getProtocol(protocol: string)`
Get detailed data for a specific protocol.

**Parameters:**
- `protocol`: Protocol slug (e.g., "uniswap", "aave")

**Example:**
```typescript
const uniswap = await getProtocol("uniswap");
console.log(uniswap.tvl);
console.log(uniswap.chains); // Chains where deployed
console.log(uniswap.chainTvls); // TVL breakdown by chain
```

#### `getChains()`
Get all blockchains with TVL data.

**Returns:** Array of `Chain` objects

**Example:**
```typescript
const chains = await getChains();

// Sort by TVL
const topChains = chains.sort((a, b) => b.tvl - a.tvl);

console.log(topChains[0].name); // "Ethereum"
console.log(topChains[0].tvl);  // 50000000000
```

#### `getChainHistoricalTvl(chain: string)`
Get historical TVL data for a blockchain.

**Parameters:**
- `chain`: Chain name (e.g., "Ethereum", "Base")

**Returns:** Array of `{ date: number, tvl: number }` points

**Example:**
```typescript
const ethHistory = await getChainHistoricalTvl("Ethereum");

// Calculate TVL growth
const oldest = ethHistory[0];
const newest = ethHistory[ethHistory.length - 1];
const growth = ((newest.tvl - oldest.tvl) / oldest.tvl) * 100;
console.log(`TVL grew ${growth.toFixed(2)}%`);
```

## Helper Functions

### `coingeckoIdToDefillama(coinId: string)`
Convert CoinGecko ID to DeFiLlama format.

```typescript
const ethId = coingeckoIdToDefillama("ethereum");
// Returns: "coingecko:ethereum"
```

### `tokenToDefillama(chain: string, address: string)`
Build DeFiLlama identifier from chain and address.

```typescript
const usdcId = tokenToDefillama(
  "ethereum",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
);
// Returns: "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
```

### `getCommonTokenId(symbol: string)`
Get DeFiLlama ID for common tokens.

```typescript
const ethId = getCommonTokenId("ETH");     // "coingecko:ethereum"
const usdcId = getCommonTokenId("USDC");   // "ethereum:0xa0b8..."
const baseUsdc = getCommonTokenId("BASE:USDC"); // "base:0x8335..."
```

### `formatUsd(value: string | number)`
Format numbers as USD strings.

```typescript
formatUsd(1500000);        // "$1.50M"
formatUsd(5000000000);     // "$5.00B"
formatUsd(750.50);         // "$750.50"
```

### `formatPercentChange(value: number)`
Format percentage changes with sign.

```typescript
formatPercentChange(5.25);   // "+5.25%"
formatPercentChange(-2.8);   // "-2.80%"
formatPercentChange(0);      // "0.00%"
```

### `clearAllCaches()`
Manually clear all API response caches.

```typescript
clearAllCaches(); // Clears price, pool, and protocol caches
```

## Type Definitions

### `TokenPrice`
```typescript
interface TokenPrice {
  decimals: number;
  price: number;
  symbol: string;
  timestamp: number;
  confidence: number; // 0-1, price confidence score
}
```

### `YieldPool`
```typescript
interface YieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;      // Base APY
  apyReward: number | null;    // Reward APY
  apy: number;                 // Total APY
  rewardTokens: string[] | null;
  pool: string;                // Pool ID
  stablecoin: boolean;
  ilRisk: string;              // Impermanent loss risk
  volumeUsd1d: number | null;  // 24h volume
  volumeUsd7d: number | null;  // 7d volume
  // ... additional fields
}
```

### `Protocol`
```typescript
interface Protocol {
  id: string;
  name: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  category: string;
  chains: string[];
  tvl: number;
  chainTvls: Record<string, number>;
  change_1h: number | null;
  change_1d: number | null;
  change_7d: number | null;
  // ... additional fields
}
```

## Caching Strategy

The service implements automatic caching:

| Data Type | Cache Duration | Cache Key Format |
|-----------|----------------|------------------|
| Token Prices | 1 minute | `prices:{coin1,coin2}` |
| Historical Prices | 1 minute | `historical:{timestamp}:{coins}` |
| Yield Pools | 3 minutes | `yields:all` |
| DEX Volumes | 3 minutes | `dex:all` or `dex:chain:{chain}` |
| Protocols | 5 minutes | `protocols:all` or `protocol:{name}` |
| Chains | 5 minutes | `chains:all` |

**Manual Cache Control:**
```typescript
import { clearAllCaches } from './defillama';

// Clear all caches
clearAllCaches();
```

## Error Handling

All functions throw descriptive errors:

```typescript
try {
  const prices = await getCurrentPrices(["invalid:token"]);
} catch (error) {
  // Error message includes HTTP status and API response
  console.error(error.message);
  // "DeFiLlama API error: 404 - Token not found"
}
```

## Common Patterns

### Real-Time Price Dashboard
```typescript
async function buildPriceDashboard() {
  const tokens = [
    "coingecko:ethereum",
    "coingecko:bitcoin",
    "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
  ];

  const { coins } = await getCurrentPrices(tokens);

  return Object.entries(coins).map(([id, data]) => ({
    symbol: data.symbol,
    price: formatUsd(data.price),
    confidence: `${(data.confidence * 100).toFixed(1)}%`
  }));
}
```

### Find Best Yield Opportunities
```typescript
async function findBestYields(minTvl = 1000000, minApy = 5) {
  const pools = await getYieldPools("Base");

  return pools.data
    .filter(pool =>
      pool.tvlUsd >= minTvl &&
      pool.apy >= minApy &&
      pool.stablecoin
    )
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 10)
    .map(pool => ({
      project: pool.project,
      symbol: pool.symbol,
      apy: `${pool.apy.toFixed(2)}%`,
      tvl: formatUsd(pool.tvlUsd)
    }));
}
```

### Multi-Chain Price Comparison
```typescript
async function compareUsdcPrices() {
  const usdcAddresses = [
    "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    "arbitrum:0xaf88d065e77c8cc2239327c5edb3a432268e5831"
  ];

  const { coins } = await getCurrentPrices(usdcAddresses);

  return Object.entries(coins).map(([id, data]) => ({
    chain: id.split(":")[0],
    price: data.price,
    deviation: Math.abs(data.price - 1) * 100 // % from $1
  }));
}
```

## No API Key Required! 🎉

Unlike CoinGecko, DeFiLlama requires **zero configuration**:

- ❌ No API keys
- ❌ No rate limits
- ❌ No authentication
- ✅ Just import and use!

## Resources

- [DeFiLlama Website](https://defillama.com)
- [API Documentation](https://defillama.com/docs/api)
- [Coins API](https://coins.llama.fi)
- [GitHub](https://github.com/DefiLlama)

---

**Questions?** Check the [DEFILLAMA_MIGRATION.md](../../DEFILLAMA_MIGRATION.md) guide.
