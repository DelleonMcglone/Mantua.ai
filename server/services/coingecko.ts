/**
 * CoinGecko API Integration Service
 * No API key required for basic usage - works out of the box!
 * Optional: Set COINGECKO_API_KEY env var for higher rate limits
 */

const BASE_URL = "https://api.coingecko.com/api/v3";

// Type definitions for CoinGecko API responses
export interface SimplePriceResponse {
  [coinId: string]: {
    usd?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
  };
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  ath: number;
  atl: number;
}

export interface HistoricalChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface PoolData {
  id: string;
  type: string;
  attributes: {
    name: string;
    address: string;
    base_token_price_usd: string;
    quote_token_price_usd: string;
    pool_created_at: string;
    reserve_in_usd: string;
    volume_usd?: {
      h24?: string;
      h6?: string;
      h1?: string;
      m5?: string;
    };
    price_change_percentage?: {
      h24?: string;
      h6?: string;
      h1?: string;
      m5?: string;
    };
  };
  relationships: {
    dex: {
      data: {
        id: string;
        type: string;
      };
    };
    base_token: {
      data: {
        id: string;
        type: string;
      };
    };
    quote_token: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface TrendingPool {
  data: PoolData[];
  included?: any[];
}

export interface PoolSearchResult {
  data: PoolData[];
}

/**
 * Fetch JSON from CoinGecko API with optional API key
 */
async function fetchCoinGecko<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  // Build headers - only include API key header if key is provided
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "User-Agent": "Mantua-AI/1.0 (+https://mantua.ai)",
  };
  
  // Add API key as header if available (optional - works without it)
  if (apiKey) {
    headers["x-cg-demo-api-key"] = apiKey;
  }
  
  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Consider adding a COINGECKO_API_KEY for higher limits.");
    }
    throw new Error(`CoinGecko API error: ${response.status} - ${text}`);
  }
  
  return (await response.json()) as T;
}

/**
 * Get current prices for one or multiple cryptocurrencies
 * @param coinIds - Comma-separated coin IDs (e.g., "bitcoin,ethereum")
 * @param vsCurrency - Currency to compare against (default: "usd")
 * @param includeMarketCap - Include market cap data
 * @param include24hrVol - Include 24h volume data
 * @param include24hrChange - Include 24h price change data
 */
export async function getSimplePrice(
  coinIds: string | string[],
  vsCurrency = "usd",
  includeMarketCap = true,
  include24hrVol = true,
  include24hrChange = true
): Promise<SimplePriceResponse> {
  const ids = Array.isArray(coinIds) ? coinIds.join(",") : coinIds;
  const params: Record<string, string> = {
    ids,
    vs_currencies: vsCurrency,
  };
  
  if (includeMarketCap) params.include_market_cap = "true";
  if (include24hrVol) params.include_24hr_vol = "true";
  if (include24hrChange) params.include_24hr_change = "true";
  
  return fetchCoinGecko<SimplePriceResponse>("/simple/price", params);
}

/**
 * Get market data for multiple coins
 * @param vsCurrency - Currency to compare against
 * @param coinIds - Optional array of coin IDs to filter
 * @param perPage - Number of results per page (max 250)
 * @param page - Page number
 */
export async function getCoinsMarkets(
  vsCurrency = "usd",
  coinIds?: string[],
  perPage = 10,
  page = 1
): Promise<CoinMarketData[]> {
  const params: Record<string, string> = {
    vs_currency: vsCurrency,
    per_page: perPage.toString(),
    page: page.toString(),
    order: "market_cap_desc",
  };
  
  if (coinIds && coinIds.length > 0) {
    params.ids = coinIds.join(",");
  }
  
  return fetchCoinGecko<CoinMarketData[]>("/coins/markets", params);
}

/**
 * Get historical market chart data for a coin
 * @param coinId - CoinGecko coin ID
 * @param vsCurrency - Currency to compare against
 * @param days - Number of days (1, 7, 14, 30, 90, 180, 365, or "max")
 */
export async function getCoinMarketChart(
  coinId: string,
  vsCurrency = "usd",
  days: number | string = 7
): Promise<HistoricalChart> {
  const params: Record<string, string> = {
    vs_currency: vsCurrency,
    days: days.toString(),
  };
  
  return fetchCoinGecko<HistoricalChart>(`/coins/${coinId}/market_chart`, params);
}

/**
 * Search for liquidity pools across DEXes
 * @param query - Search query (e.g., "ETH cbBTC")
 * @param network - Optional network filter (e.g., "base")
 */
export async function searchPools(query: string, network?: string): Promise<PoolSearchResult> {
  const params: Record<string, string> = {
    query,
  };
  
  if (network) {
    params.network = network;
  }
  
  return fetchCoinGecko<PoolSearchResult>("/onchain/search/pools", params);
}

/**
 * Get specific pool information on Base network
 * @param poolAddress - The pool contract address
 */
export async function getPoolInfoBaseNetwork(poolAddress: string): Promise<{ data: PoolData }> {
  return fetchCoinGecko<{ data: PoolData }>(`/onchain/networks/base/pools/${poolAddress}`);
}

/**
 * Get trending pools on Base network
 * @param page - Page number (default: 1)
 */
export async function getTrendingPoolsOnBase(page = 1): Promise<TrendingPool> {
  const params: Record<string, string> = {
    page: page.toString(),
  };
  
  return fetchCoinGecko<TrendingPool>("/onchain/networks/base/trending_pools", params);
}

/**
 * Search and analyze ETH/cbBTC pools on Base network
 * Returns detailed information about the top pools
 */
export async function searchEthCbBtcPoolOnBase(): Promise<{
  pools: Array<{
    name: string;
    address: string;
    dex: string;
    reserveUsd: string;
    volume24h: string;
    volume1h?: string;
    volume6h?: string;
    volume5m?: string;
    priceChange24h?: string;
    baseTokenPriceUsd: string;
    quoteTokenPriceUsd: string;
  }>;
  topPool?: any;
}> {
  try {
    // Search for ETH cbBTC pools
    const searchResults = await searchPools("ETH cbBTC", "base");
    
    if (!searchResults.data || searchResults.data.length === 0) {
      return { pools: [] };
    }
    
    // Format the top 3 pools
    const formattedPools = searchResults.data.slice(0, 3).map((pool) => ({
      name: pool.attributes.name,
      address: pool.attributes.address,
      dex: pool.relationships.dex.data.id,
      reserveUsd: pool.attributes.reserve_in_usd,
      volume24h: pool.attributes.volume_usd?.h24 || "0",
      volume6h: pool.attributes.volume_usd?.h6,
      volume1h: pool.attributes.volume_usd?.h1,
      volume5m: pool.attributes.volume_usd?.m5,
      priceChange24h: pool.attributes.price_change_percentage?.h24,
      baseTokenPriceUsd: pool.attributes.base_token_price_usd,
      quoteTokenPriceUsd: pool.attributes.quote_token_price_usd,
    }));
    
    return {
      pools: formattedPools,
      topPool: formattedPools[0],
    };
  } catch (error) {
    console.error("[CoinGecko] Failed to search ETH/cbBTC pools:", error);
    throw error;
  }
}

/**
 * Get token price by contract address on a specific network
 * @param network - Network name (e.g., "base", "ethereum")
 * @param tokenAddress - Token contract address
 */
export async function getTokenPriceOnChain(
  network: string,
  tokenAddress: string
): Promise<{ data: { attributes: { token_prices: Record<string, string> } } }> {
  return fetchCoinGecko(`/onchain/simple/networks/${network}/token_price/${tokenAddress}`);
}

/**
 * Format USD value for display
 */
export function formatUsd(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "$0";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(value: string | number | undefined): string {
  if (!value) return "0.00%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "0.00%";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}
