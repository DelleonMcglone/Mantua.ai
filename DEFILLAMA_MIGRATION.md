# DeFiLlama API Migration Guide

## Overview

This document outlines the migration from CoinGecko API to DeFiLlama API for Mantua.AI. DeFiLlama provides comprehensive DeFi data with **NO API KEY required** and **completely FREE** access.

## Why DeFiLlama?

- **100% Free**: No rate limits, no API keys needed
- **DeFi-Focused**: Purpose-built for DeFi applications
- **Comprehensive Data**: Prices, DEX volumes, yield pools, protocols, TVL
- **Multi-Chain**: Native support for all major chains
- **Reliable**: Built and maintained by DeFi community

## Changes Summary

### Files Modified

1. **Server-Side**
   - ✅ Created: [server/services/defillama.ts](server/services/defillama.ts)
   - ✅ Updated: [server/services/analyze.ts](server/services/analyze.ts)
   - ✅ Updated: [server/routes.ts](server/routes.ts)
   - ⚠️ Deprecated: `server/services/coingecko.ts` (kept for backward compatibility)

2. **Client-Side**
   - ✅ Updated: [client/src/hooks/useTokenUsdPrices.ts](client/src/hooks/useTokenUsdPrices.ts)

### API Endpoints Changed

#### Old CoinGecko Endpoints (Still Available)
```
GET /api/coingecko/prices
GET /api/coingecko/markets
GET /api/coingecko/chart/:coinId
GET /api/coingecko/pools/search
GET /api/coingecko/pools/base/:poolAddress
GET /api/coingecko/pools/base/trending
GET /api/coingecko/pools/eth-cbbtc
```

#### New DeFiLlama Endpoints (Recommended)
```
GET /api/defillama/prices/current?coins=ethereum:0x...,coingecko:bitcoin
GET /api/defillama/prices/historical/:timestamp?coins=...
GET /api/defillama/dex/all
GET /api/defillama/dex/chain/:chain
GET /api/defillama/dex/:dex/summary
GET /api/defillama/pools?chain=Base
GET /api/defillama/pools/trending/:chain?sortBy=tvl&limit=10
GET /api/defillama/pools/search?token1=ETH&token2=BTC&chain=Base
GET /api/defillama/protocols
GET /api/defillama/protocol/:protocol
GET /api/defillama/chains
```

## Migration Examples

### 1. Token Prices

**Before (CoinGecko):**
```typescript
// Old format
const response = await fetch(
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd'
);
const data = await response.json();
// { ethereum: { usd: 3200 }, bitcoin: { usd: 67000 } }
```

**After (DeFiLlama):**
```typescript
// New format - more flexible!
const response = await fetch(
  'https://coins.llama.fi/prices/current/coingecko:ethereum,coingecko:bitcoin'
);
const data = await response.json();
// {
//   coins: {
//     "coingecko:ethereum": { price: 3200, symbol: "ETH", confidence: 0.99 },
//     "coingecko:bitcoin": { price: 67000, symbol: "BTC", confidence: 0.99 }
//   }
// }

// Also supports contract addresses!
const usdcPrice = await fetch(
  'https://coins.llama.fi/prices/current/ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
);
```

### 2. Pool Data

**Before (CoinGecko - Limited):**
```typescript
const pools = await searchEthCbBtcPoolOnBase();
// Limited pool data from CoinGecko
```

**After (DeFiLlama - Rich Data):**
```typescript
import { searchPoolsByTokens, getTrendingPools } from './services/defillama';

// Search specific token pairs
const pools = await searchPoolsByTokens("ETH", "BTC", "Base");
// Returns: Array of pools with TVL, APY, volume, etc.

// Get trending pools
const trending = await getTrendingPools("Base", "tvl", 10);
// Returns: Top 10 pools by TVL with full metrics
```

### 3. Frontend Hook Usage

**Before:**
```typescript
// In useTokenUsdPrices.ts
const COINGECKO_IDS = {
  ETH: "ethereum",
  USDC: "usd-coin",
};

fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
```

**After:**
```typescript
// Now uses DeFiLlama
const DEFILLAMA_IDS = {
  ETH: "coingecko:ethereum",
  USDC: "coingecko:usd-coin",
  WETH: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Can use addresses!
};

fetch(`https://coins.llama.fi/prices/current/${coinString}`)
```

## Token Identifier Format

DeFiLlama uses a flexible format for identifying tokens:

### Format Options:

1. **CoinGecko IDs**: `coingecko:{id}`
   ```
   coingecko:ethereum
   coingecko:bitcoin
   coingecko:usd-coin
   ```

2. **Contract Addresses**: `{chain}:{address}`
   ```
   ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48  (USDC on Ethereum)
   base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913      (USDC on Base)
   arbitrum:0xaf88d065e77c8cc2239327c5edb3a432268e5831  (USDC on Arbitrum)
   ```

### Helper Functions

```typescript
import {
  coingeckoIdToDefillama,
  tokenToDefillama,
  getCommonTokenId
} from './services/defillama';

// Convert CoinGecko ID
const ethId = coingeckoIdToDefillama("ethereum"); // "coingecko:ethereum"

// Build from chain + address
const usdcId = tokenToDefillama("ethereum", "0xa0b8..."); // "ethereum:0xa0b8..."

// Get common tokens
const btcId = getCommonTokenId("BTC"); // "coingecko:bitcoin"
```

## New Features Available

### 1. DEX Volume Analytics
```typescript
import { getAllDexVolumes, getDexVolumesByChain } from './services/defillama';

// Get all DEX volumes
const allDex = await getAllDexVolumes();

// Get volumes for specific chain
const baseDex = await getDexVolumesByChain("Base");
```

### 2. Yield Farming Pools
```typescript
import { getYieldPools, getTrendingPools } from './services/defillama';

// Get all pools (optionally filter by chain)
const allPools = await getYieldPools();
const basePools = await getYieldPools("Base");

// Get trending by different metrics
const highestAPY = await getTrendingPools("Base", "apy", 10);
const highestTVL = await getTrendingPools("Base", "tvl", 10);
const highestVolume = await getTrendingPools("Base", "volume", 10);
```

### 3. Protocol & TVL Data
```typescript
import { getProtocols, getProtocol, getChains } from './services/defillama';

// Get all protocols with TVL
const protocols = await getProtocols();

// Get specific protocol details
const uniswap = await getProtocol("uniswap");

// Get all chains with TVL data
const chains = await getChains();
```

### 4. Historical Data
```typescript
import { getHistoricalPrices, getChainHistoricalTvl } from './services/defillama';

// Get prices at specific timestamp
const timestamp = Math.floor(Date.now() / 1000) - 86400; // 24h ago
const historicalPrices = await getHistoricalPrices(timestamp, [
  "coingecko:ethereum",
  "coingecko:bitcoin"
]);

// Get chain TVL history
const ethTvlHistory = await getChainHistoricalTvl("Ethereum");
```

## Built-in Caching

The DeFiLlama service includes automatic caching:

- **Token Prices**: 1 minute cache
- **Pool Data**: 3 minute cache
- **Protocol/Chain Data**: 5 minute cache

```typescript
import { clearAllCaches } from './services/defillama';

// Manually clear all caches if needed
clearAllCaches();
```

## Testing the Migration

### 1. Test Token Prices
```bash
# Using the new DeFiLlama endpoint
curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum,coingecko:bitcoin"
```

### 2. Test Pool Search
```bash
# Search for ETH/BTC pools on Base
curl "http://localhost:5000/api/defillama/pools/search?token1=ETH&token2=BTC&chain=Base"
```

### 3. Test Trending Pools
```bash
# Get top 10 pools on Base by TVL
curl "http://localhost:5000/api/defillama/pools/trending/Base?sortBy=tvl&limit=10"
```

### 4. Test DEX Volumes
```bash
# Get DEX volumes for Base
curl "http://localhost:5000/api/defillama/dex/chain/Base"
```

## Backward Compatibility

The old CoinGecko endpoints remain functional for backward compatibility. However, **it's recommended to migrate to DeFiLlama endpoints** for:

- Better rate limits (none!)
- More comprehensive data
- Multi-chain support
- No API key management

## Common Token Mappings

| Token | CoinGecko ID | DeFiLlama Format |
|-------|-------------|------------------|
| ETH   | ethereum    | `coingecko:ethereum` |
| BTC   | bitcoin     | `coingecko:bitcoin` |
| USDC  | usd-coin    | `coingecko:usd-coin` or `ethereum:0xa0b8...` |
| USDT  | tether      | `coingecko:tether` |
| DAI   | dai         | `coingecko:dai` |
| WETH  | weth        | `ethereum:0xc02a...` |
| cbBTC | coinbase-wrapped-bitcoin | `coingecko:coinbase-wrapped-bitcoin` |

## Support Chain Names

DeFiLlama supports these chains (case-insensitive):

- Ethereum
- Base
- Arbitrum
- Optimism
- Polygon
- Avalanche
- BSC (Binance Smart Chain)
- Solana
- And 100+ more!

## Error Handling

DeFiLlama errors are handled gracefully with automatic retries built into the fetch logic:

```typescript
try {
  const prices = await getCurrentPrices(["coingecko:ethereum"]);
} catch (error) {
  // Error includes helpful context
  console.error(error.message);
  // "DeFiLlama API error: 404 - Coin not found"
}
```

## Performance Improvements

| Metric | CoinGecko (Free Tier) | DeFiLlama |
|--------|----------------------|-----------|
| Rate Limit | 10-50 calls/min | Unlimited |
| API Key Required | Yes (for higher limits) | No |
| Cache Duration | Manual | Built-in (1-5 min) |
| Multi-chain | Limited | Native |
| DeFi-Specific Data | Limited | Comprehensive |

## Next Steps

1. ✅ Migration is complete and active
2. ⚠️ Old CoinGecko endpoints still work (backward compatible)
3. 📝 Update frontend components to use new DeFiLlama data
4. 🧪 Test natural language queries with enhanced data
5. 🚀 Deploy and monitor

## Resources

- [DeFiLlama API Docs](https://defillama.com/docs/api)
- [DeFiLlama Coins API](https://coins.llama.fi)
- [DeFiLlama GitHub](https://github.com/DefiLlama)

## Questions?

For issues or questions about the migration:
1. Check the API response format in [server/services/defillama.ts](server/services/defillama.ts)
2. Review examples in this document
3. Test endpoints directly using curl or Postman
4. Check the built-in cache settings

---

**Migration Status**: ✅ Complete and Active

**Maintained by**: Mantua.AI Team
**Last Updated**: 2025-11-09
