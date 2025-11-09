# DeFiLlama Integration Testing Guide

Quick reference for testing the DeFiLlama API integration in Mantua.AI.

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Server should be running on `http://localhost:5000`

## API Endpoint Tests

### 1. Token Prices (Current)

**Test ETH and BTC prices:**
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum,coingecko:bitcoin"
```

**Expected Response:**
```json
{
  "coins": {
    "coingecko:ethereum": {
      "decimals": 18,
      "price": 3200.5,
      "symbol": "ETH",
      "timestamp": 1699564800,
      "confidence": 0.99
    },
    "coingecko:bitcoin": {
      "decimals": 8,
      "price": 67000.0,
      "symbol": "BTC",
      "timestamp": 1699564800,
      "confidence": 0.99
    }
  }
}
```

**Test USDC on Base (by contract address):**
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
```

### 2. Pool Search

**Find ETH/BTC pools on Base:**
```bash
curl "http://localhost:5000/api/defillama/pools/search?token1=ETH&token2=BTC&chain=Base"
```

**Expected Response:**
```json
{
  "pools": [
    {
      "chain": "Base",
      "project": "aerodrome",
      "symbol": "WETH-cbBTC",
      "tvlUsd": 5000000,
      "apy": 12.5,
      "volumeUsd1d": 1000000,
      "stablecoin": false
    }
  ]
}
```

### 3. Trending Pools

**Top 5 pools on Base by TVL:**
```bash
curl "http://localhost:5000/api/defillama/pools/trending/Base?sortBy=tvl&limit=5"
```

**Top pools by APY:**
```bash
curl "http://localhost:5000/api/defillama/pools/trending/Base?sortBy=apy&limit=5"
```

**Top pools by Volume:**
```bash
curl "http://localhost:5000/api/defillama/pools/trending/Ethereum?sortBy=volume&limit=10"
```

### 4. DEX Volumes

**All DEX volumes:**
```bash
curl "http://localhost:5000/api/defillama/dex/all"
```

**Base chain DEX volumes:**
```bash
curl "http://localhost:5000/api/defillama/dex/chain/Base"
```

**Uniswap summary:**
```bash
curl "http://localhost:5000/api/defillama/dex/uniswap/summary"
```

### 5. Protocols & TVL

**All protocols:**
```bash
curl "http://localhost:5000/api/defillama/protocols"
```

**Uniswap details:**
```bash
curl "http://localhost:5000/api/defillama/protocol/uniswap"
```

**All chains:**
```bash
curl "http://localhost:5000/api/defillama/chains"
```

### 6. Analysis Endpoints (Updated with DeFiLlama)

**Analyze token prices:**
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"question": "what is the price of ethereum and bitcoin?"}'
```

**Analyze pool data:**
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"question": "show me trending pools on base"}'
```

**Analyze ETH/BTC pools:**
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"question": "find eth btc pools"}'
```

## Frontend Tests

### 1. Token Price Hook

The `useTokenUsdPrices` hook now uses DeFiLlama. Test in your browser console:

```javascript
// Open browser dev tools on the Swap page
// The hook should automatically fetch prices for ETH, USDC, etc.
// Check Network tab for requests to coins.llama.fi
```

### 2. Swap Interface

1. Navigate to `/swap`
2. Prices should load automatically using DeFiLlama
3. Check browser Network tab for:
   - URL: `https://coins.llama.fi/prices/current/...`
   - No errors in console

### 3. Chat Analysis

1. Navigate to `/` (Home/Chat)
2. Try these queries:
   - "What's the price of ethereum?"
   - "Show me trending pools on base"
   - "Find eth btc liquidity pools"
3. Responses should show "Source: DeFiLlama"

## Verification Checklist

- [ ] Token prices load successfully
- [ ] Pool search returns results
- [ ] Trending pools endpoint works
- [ ] DEX volume data is accessible
- [ ] Analysis endpoint uses DeFiLlama data
- [ ] Frontend price hook works
- [ ] No API key errors
- [ ] Cache is working (check logs for repeated requests)
- [ ] Error handling works (try invalid tokens)

## Common Test Cases

### Success Cases

**✅ Valid CoinGecko ID format:**
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum"
```

**✅ Valid contract address:**
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
```

**✅ Multiple tokens:**
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum,coingecko:bitcoin,coingecko:usd-coin"
```

**✅ Pool search with chain filter:**
```bash
curl "http://localhost:5000/api/defillama/pools/search?token1=ETH&token2=USDC&chain=Base"
```

### Error Cases

**❌ Missing required parameter:**
```bash
curl "http://localhost:5000/api/defillama/prices/current"
# Expected: 400 Bad Request - "coins query parameter is required"
```

**❌ Invalid chain name:**
```bash
curl "http://localhost:5000/api/defillama/pools/trending/InvalidChain"
# Expected: No results or empty array
```

## Performance Testing

### Cache Verification

1. **First request** (cache miss):
```bash
time curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum"
# Note the response time (e.g., 500ms)
```

2. **Second request** (cache hit):
```bash
time curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum"
# Should be much faster (e.g., <10ms)
```

3. **Wait 61 seconds** and request again (cache expired):
```bash
sleep 61
time curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum"
# Back to ~500ms (fresh API call)
```

## Comparing Old vs New

### CoinGecko (Old - Still Works)
```bash
curl "http://localhost:5000/api/coingecko/prices?coinIds=ethereum,bitcoin"
```

### DeFiLlama (New - Recommended)
```bash
curl "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum,coingecko:bitcoin"
```

**Key Differences:**
- DeFiLlama: More data fields (confidence, timestamp, decimals)
- DeFiLlama: Support for contract addresses
- DeFiLlama: No API key required
- DeFiLlama: Better multi-chain support

## Automated Test Script

Create a file `test-defillama.sh`:

```bash
#!/bin/bash

echo "🧪 Testing DeFiLlama Integration..."
echo ""

# Test 1: Token Prices
echo "1️⃣ Testing token prices..."
curl -s "http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum" | jq '.coins | keys'
echo ""

# Test 2: Pool Search
echo "2️⃣ Testing pool search..."
curl -s "http://localhost:5000/api/defillama/pools/search?token1=ETH&token2=USDC&chain=Base" | jq '.pools | length'
echo ""

# Test 3: Trending Pools
echo "3️⃣ Testing trending pools..."
curl -s "http://localhost:5000/api/defillama/pools/trending/Base?limit=3" | jq '.pools | length'
echo ""

# Test 4: Chains
echo "4️⃣ Testing chains..."
curl -s "http://localhost:5000/api/defillama/chains" | jq '.chains | length'
echo ""

# Test 5: Analysis
echo "5️⃣ Testing analysis endpoint..."
curl -s -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"question": "price of ethereum"}' | jq '.source'
echo ""

echo "✅ All tests complete!"
```

Run with:
```bash
chmod +x test-defillama.sh
./test-defillama.sh
```

## Browser Testing

Open browser console and run:

```javascript
// Test DeFiLlama price endpoint directly
fetch('http://localhost:5000/api/defillama/prices/current?coins=coingecko:ethereum')
  .then(r => r.json())
  .then(data => console.log('ETH Price:', data.coins['coingecko:ethereum'].price));

// Test pool search
fetch('http://localhost:5000/api/defillama/pools/search?token1=ETH&token2=USDC&chain=Base')
  .then(r => r.json())
  .then(data => console.log('Pools found:', data.pools.length));

// Test analysis
fetch('http://localhost:5000/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'what is the price of ethereum?' })
})
  .then(r => r.json())
  .then(data => console.log('Analysis:', data));
```

## Expected Behavior

### ✅ Working Correctly

- Prices update within 1 minute
- Pool data shows TVL and APY
- Analysis returns "Source: DeFiLlama"
- No 429 rate limit errors
- Fast response times (<100ms with cache)
- No API key warnings

### ❌ Issues to Debug

- 404 errors → Check token identifier format
- 500 errors → Check server logs
- Empty results → Verify chain name capitalization
- Slow responses → Check if cache is working
- CORS errors → Ensure proper headers

## Monitoring

Watch server logs for:

```bash
# Cache hits (fast responses)
[DeFiLlama] Cache hit for prices:coingecko:ethereum

# Cache misses (API calls)
[DeFiLlama] Fetching from API: https://coins.llama.fi/prices/current/...

# Errors
[DeFiLlama] API error: 404 - Token not found
```

## Next Steps

After successful testing:

1. ✅ All endpoints return data
2. ✅ Frontend displays prices correctly
3. ✅ Analysis uses DeFiLlama
4. ✅ No errors in production
5. 🚀 Ready to deploy!

---

**Need help?** Check [DEFILLAMA_MIGRATION.md](./DEFILLAMA_MIGRATION.md) for detailed migration info.
