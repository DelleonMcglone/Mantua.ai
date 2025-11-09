# Analyze Mode - User Guide

Complete guide for using Analyze Mode in Mantua.AI to get real-time DeFi insights.

## What is Analyze Mode?

Analyze Mode is a powerful feature that lets you query DeFi data using natural language. Get instant insights on:
- Token prices
- Protocol TVL and analytics
- Liquidity pools and APY
- DEX trading volumes
- Chain analytics and growth

All data is powered by **DeFiLlama** - completely free with no API keys required!

## How to Activate Analyze Mode

There are 3 ways to activate Analyze Mode:

### Method 1: Click the + Button
1. Click the **+** button in the chat input
2. Select **"Analyze"** from the menu
3. Analyze Mode activates immediately

### Method 2: Type "Analyze"
1. Type `analyze` in the chat input
2. Press Enter
3. Analyze Mode activates

### Method 3: Direct Questions
Just ask a market question directly:
- "What is the price of ethereum?"
- "Show me trending pools"
- The system automatically detects analysis queries!

## Interface Overview

When Analyze Mode is active, you'll see:

### 1. Header Card
- **Status**: Shows "Analyze Mode Active"
- **Description**: Explains what you can query
- **Data Sources**: Displays DeFiLlama badges (Free & Unlimited)

### 2. Category Filters
Quick filter buttons to browse by category:
- **All** - View all query examples
- **Token Prices** - Price queries
- **Protocols** - Protocol TVL and data
- **Liquidity Pools** - Pool APY and liquidity
- **DEX Data** - Trading volumes
- **Chain Analytics** - Chain growth and TVL

### 3. Query Example Cards
Pre-made query cards you can click:
- Click any card to run that query instantly
- Each shows:
  - Icon for the category
  - Query description
  - Example query text
  - Popular/Trending badge (if applicable)

### 4. Custom Query Help
- Shows examples of custom queries
- Explains query formats
- Helps you write your own questions

### 5. Data Coverage Info
Grid showing what you can analyze with icons:
- Token Prices (real-time with confidence)
- Protocols (TVL, chains, historical)
- Yield Pools (APY, volume, rewards)
- DEX Analytics (trading volumes)

## Query Examples

### Token Prices

**Get single token price:**
```
What is the price of ethereum?
```

**Get multiple token prices:**
```
Show me prices for ethereum and bitcoin
```

**USDC price data:**
```
What's the current USDC price?
```

**Response includes:**
- Current price in USD
- Token symbol
- Confidence score (0-100%)
- Timestamp of data

### Protocol Analytics

**Analyze specific protocol:**
```
Analyze Uniswap protocol
```

**Top protocol movers:**
```
What are the top protocol movers this week?
```

**Protocol TVL:**
```
What's the TVL for Aave?
```

**Response includes:**
- Protocol name and TVL
- 1-day, 7-day changes
- Chain breakdown
- Charts showing growth

### Liquidity Pools

**Find pools by token pair:**
```
Find ETH BTC pools on Base
```

**Trending pools:**
```
Show me trending pools on Base
```

**High APY pools:**
```
Show me the highest APY pools on Arbitrum
```

**Response includes:**
- Pool symbol (e.g., WETH-USDC)
- Project name (e.g., Uniswap V3)
- TVL in USD
- APY percentage
- 24h trading volume

### DEX Volumes

**Chain-specific volumes:**
```
Show DEX volumes for Ethereum
```

**Compare DEX volumes:**
```
Compare trading volumes across DEXes
```

**Response includes:**
- DEX names
- Total volume
- 24h/7d changes
- Volume charts

### Chain Analytics

**Chain TVL growth:**
```
Show me chain TVL growth
```

**Which chains are growing:**
```
What chains have the most TVL growth?
```

**Response includes:**
- Chain names
- Current TVL
- 1-day, 7-day percentage changes
- Bar charts comparing chains

## Custom Queries

You can ask any DeFi-related question using natural language:

### Price Queries
```
Compare prices for ETH, USDC, and DAI
What's the price of coinbase wrapped bitcoin?
Show me token prices
```

### Protocol Queries
```
Analyze MakerDAO
What's the TVL for Curve Finance?
Show me Compound protocol data
```

### Pool Queries
```
Find USDC pools on Ethereum
Show me ETH/USDC liquidity pools
What are the best yield pools on Base?
```

### Volume Queries
```
What are the trading volumes for Uniswap?
Show me DEX volumes for Arbitrum
Compare volumes across chains
```

## Understanding Results

### Result Cards

Each analysis returns a beautiful card showing:

**Header:**
- "Analysis Result" title
- Summary text explaining the findings
- Data source (usually "DeFiLlama")

**Metrics Grid:**
- 2-column grid of metric cards
- Each card shows:
  - Title (token/protocol/pool name)
  - Detailed stats (price, APY, TVL, etc.)
  - Formatted values ($1.5M, +5.2%, etc.)

**Charts (when applicable):**
- Area charts for time-series data
- Bar charts for comparisons
- Interactive tooltips on hover
- Responsive design

### Metric Formatting

Values are automatically formatted for readability:

**USD Values:**
- `$1,500,000,000` → `$1.5B`
- `$2,500,000` → `$2.5M`
- `$15,000` → `$15.0K`
- `$99.50` → `$99.50`

**Percentages:**
- `5.25` → `+5.25%`
- `-2.8` → `-2.80%`
- `0` → `0.00%`

**Confidence:**
- `0.99` → `99.0%`
- `0.85` → `85.0%`

## Loading States

When fetching data, you'll see:

**In the interface:**
- Spinning loader icon
- "Fetching data from DeFiLlama..." text
- Query buttons are disabled

**In the chat:**
- "Gathering market data..." message below input
- Results appear once data is fetched

## Error Handling

If a query fails, you'll see:

**User-friendly messages:**
- "No data available for that query."
- Error explanation from the API
- Suggestions to try different query

**Common errors:**
- Token not found → Check token symbol
- No pools found → Try different chain
- No data → May not be tracked by DeFiLlama

## Tips for Best Results

### 1. Be Specific
❌ "Show me pools"
✅ "Show me ETH/USDC pools on Base"

### 2. Use Supported Chains
- Ethereum, Base, Arbitrum, Optimism
- Polygon, Avalanche, BSC, Solana
- 100+ chains supported

### 3. Use Common Token Symbols
- ETH, BTC, USDC, USDT, DAI
- cbBTC, WETH, WBTC
- Major DeFi tokens

### 4. Try Example Queries First
- Click the example cards to see how they work
- Modify examples for your needs
- Learn the query format

### 5. Check Data Source
- All data comes from DeFiLlama
- Real-time, reliable, free
- No API key needed

## Advanced Usage

### Combining Queries

You can ask follow-up questions in Analyze Mode:

```
User: "What's the price of ethereum?"
→ Result shows ETH price

User: "Now show me Uniswap protocol data"
→ Result shows Uniswap TVL and chains

User: "Find ETH pools on Base"
→ Result shows ETH pools
```

All queries stay in Analyze Mode until you exit.

### Exiting Analyze Mode

To exit Analyze Mode:

1. **Use Swap or Add Liquidity:**
   - Start a swap → Analyze Mode exits
   - Add liquidity → Analyze Mode exits

2. **Start a different conversation:**
   - Ask non-analysis questions
   - System auto-detects intent change

3. **Manually exit:**
   - Type a swap or liquidity command
   - Mode switches automatically

### Re-entering Analyze Mode

Simply click "Analyze" again or type `analyze`.

## Data Freshness

All data is cached for performance:

| Data Type | Cache Duration |
|-----------|----------------|
| Token Prices | 1 minute |
| Pool Data | 3 minutes |
| Protocol/Chain Data | 5 minutes |

Data is refreshed automatically when cache expires.

## API Endpoints Used

Behind the scenes, Analyze Mode uses these DeFiLlama APIs:

### Token Prices
```
GET https://coins.llama.fi/prices/current/{coins}
```

### Protocols
```
GET https://api.llama.fi/protocols
GET https://api.llama.fi/protocol/{name}
```

### Yield Pools
```
GET https://yields.llama.fi/pools
```

### DEX Volumes
```
GET https://api.llama.fi/overview/dexs
GET https://api.llama.fi/overview/dexs/{chain}
```

### Chains
```
GET https://api.llama.fi/v2/chains
GET https://api.llama.fi/v2/historicalChainTvl/{chain}
```

All endpoints are:
- ✅ Free
- ✅ No API key required
- ✅ Unlimited requests
- ✅ Real-time data

## Troubleshooting

### "No data available"
**Cause:** Token/protocol not found
**Solution:** Check spelling, try different symbol

### Slow responses
**Cause:** DeFiLlama API latency
**Solution:** Wait a few seconds, data is being fetched

### Results not updating
**Cause:** Cache is active
**Solution:** Wait for cache to expire (1-5 min)

### Wrong data shown
**Cause:** Multiple tokens with same symbol
**Solution:** Be more specific (e.g., "USDC on Base")

## Feature Highlights

### ✨ What Makes Analyze Mode Great

1. **One-Click Queries**
   - Pre-made query cards
   - Just click and go
   - No typing needed

2. **Natural Language**
   - Ask questions like you're talking to a person
   - No complex syntax
   - Smart intent detection

3. **Beautiful Results**
   - Clean card layouts
   - Interactive charts
   - Formatted numbers

4. **Real-Time Data**
   - Direct from DeFiLlama
   - Always up-to-date
   - High confidence scores

5. **Multi-Category**
   - Prices, pools, protocols, DEXes, chains
   - All in one place
   - Easy filtering

6. **Free Forever**
   - No API keys
   - No rate limits
   - Unlimited queries

## Examples by Use Case

### For Traders
```
What's the price of ETH and BTC?
Show me USDC pools with high APY
What are DEX volumes on Base?
```

### For Yield Farmers
```
Show me trending pools on Arbitrum
Find highest APY pools on Ethereum
What pools have USDC?
```

### For Researchers
```
Analyze Uniswap protocol
Show chain TVL growth
Compare protocol movers
```

### For Portfolio Tracking
```
Price of ETH, USDC, cbBTC
Show me all Base pools
What's the TVL for Aave?
```

## Summary

Analyze Mode gives you instant access to comprehensive DeFi data:

✅ **Easy to use** - Click examples or ask questions
✅ **Free forever** - No API keys, unlimited
✅ **Real-time data** - Powered by DeFiLlama
✅ **Beautiful UI** - Cards, charts, formatted values
✅ **Multi-category** - Prices, pools, protocols, DEXes, chains

**Get started now:**
1. Click the + button
2. Select "Analyze"
3. Click an example or ask a question!

---

**Need more help?**
- Check the [DeFiLlama Migration Guide](./DEFILLAMA_MIGRATION.md)
- Read the [API Documentation](./server/services/README_DEFILLAMA.md)
- Try the example queries above

Happy analyzing! 📊
