/**
 * DeFiLlama API Integration Service
 * FREE API - No API key required!
 * Comprehensive DeFi data: prices, DEX volumes, yields, protocols, TVL
 */

// Type definitions for DeFiLlama API responses

export interface TokenPrice {
  decimals: number;
  price: number;
  symbol: string;
  timestamp: number;
  confidence: number;
}

export interface TokenPricesResponse {
  coins: Record<string, TokenPrice>;
}

export interface DexVolume {
  totalVolume: number;
  dailyVolume: number;
  change_1d: number;
  change_7d: number;
  change_1m: number;
}

export interface DexData {
  name: string;
  volume: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
}

export interface YieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  } | null;
  poolMeta: string | null;
  mu: number | null;
  sigma: number | null;
  count: number | null;
  outlier: boolean | null;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
}

export interface Protocol {
  id: string;
  name: string;
  address: string | null;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string | null;
  gecko_id: string | null;
  cmcId: string | null;
  category: string;
  chains: string[];
  module: string;
  twitter: string | null;
  forkedFrom: string[];
  oracles: string[];
  listedAt: number;
  slug: string;
  tvl: number;
  chainTvls: Record<string, number>;
  change_1h: number | null;
  change_1d: number | null;
  change_7d: number | null;
  fdv: number | null;
  mcap: number | null;
}

export interface Chain {
  gecko_id: string | null;
  tvl: number;
  tokenSymbol: string | null;
  cmcId: string | null;
  name: string;
  chainId: number | null;
}

export interface HistoricalTvl {
  date: number;
  tvl: number;
}

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 60000) {
    // Default 1 minute cache
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create cache instances with appropriate TTLs
const priceCache = new SimpleCache(60000); // 1 minute for prices
const poolCache = new SimpleCache(180000); // 3 minutes for pools
const protocolCache = new SimpleCache(300000); // 5 minutes for protocols

/**
 * Generic fetch utility for DeFiLlama API
 */
async function fetchDefillama<T>(url: string, cacheKey?: string, cache?: SimpleCache): Promise<T> {
  // Check cache first
  if (cacheKey && cache) {
    const cached = cache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mantua-AI/1.0 (+https://mantua.ai)",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeFiLlama API error: ${response.status} - ${text}`);
  }

  const data = (await response.json()) as T;

  // Cache the result
  if (cacheKey && cache) {
    cache.set(cacheKey, data);
  }

  return data;
}

/**
 * Get current prices for tokens
 * @param coins - Array of coin identifiers in format: "chain:address" or "coingecko:id"
 * @returns Object mapping coin identifiers to price data
 *
 * Examples:
 * - ["ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"] // USDC on Ethereum
 * - ["coingecko:bitcoin", "coingecko:ethereum"]
 * - ["base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"] // USDC on Base
 */
export async function getCurrentPrices(coins: string[]): Promise<TokenPricesResponse> {
  const coinString = coins.join(",");
  const cacheKey = `prices:${coinString}`;

  return fetchDefillama<TokenPricesResponse>(
    `https://coins.llama.fi/prices/current/${coinString}`,
    cacheKey,
    priceCache
  );
}

/**
 * Get historical prices at a specific timestamp
 * @param timestamp - Unix timestamp in seconds
 * @param coins - Array of coin identifiers
 */
export async function getHistoricalPrices(
  timestamp: number,
  coins: string[]
): Promise<TokenPricesResponse> {
  const coinString = coins.join(",");
  const cacheKey = `historical:${timestamp}:${coinString}`;

  return fetchDefillama<TokenPricesResponse>(
    `https://coins.llama.fi/prices/historical/${timestamp}/${coinString}`,
    cacheKey,
    priceCache
  );
}

/**
 * Get all DEX volumes overview
 */
export async function getAllDexVolumes(): Promise<{
  totalDataChart: Array<[number, number]>;
  totalDataChartBreakdown: Array<[number, Record<string, number>]>;
  protocols: DexData[];
}> {
  return fetchDefillama(
    "https://api.llama.fi/overview/dexs",
    "dex:all",
    poolCache
  );
}

/**
 * Get DEX volumes for a specific chain
 * @param chain - Chain name (e.g., "Ethereum", "Base", "Arbitrum")
 */
export async function getDexVolumesByChain(chain: string): Promise<{
  totalDataChart: Array<[number, number]>;
  totalDataChartBreakdown: Array<[number, Record<string, number>]>;
  protocols: DexData[];
}> {
  const cacheKey = `dex:chain:${chain.toLowerCase()}`;
  return fetchDefillama(
    `https://api.llama.fi/overview/dexs/${encodeURIComponent(chain)}`,
    cacheKey,
    poolCache
  );
}

/**
 * Get summary for a specific DEX
 * @param dex - DEX name (e.g., "uniswap", "curve", "pancakeswap")
 */
export async function getDexSummary(dex: string): Promise<{
  totalVolume: number;
  change_1d: number;
  change_7d: number;
  change_1m: number;
}> {
  const cacheKey = `dex:summary:${dex.toLowerCase()}`;
  return fetchDefillama(
    `https://api.llama.fi/summary/dexs/${encodeURIComponent(dex)}`,
    cacheKey,
    poolCache
  );
}

/**
 * Get all yield farming pools
 * @param chain - Optional chain filter
 */
export async function getYieldPools(chain?: string): Promise<{ data: YieldPool[] }> {
  const response = await fetchDefillama<{ status: string; data: YieldPool[] }>(
    "https://yields.llama.fi/pools",
    "yields:all",
    poolCache
  );

  // Filter by chain if specified
  if (chain) {
    const chainLower = chain.toLowerCase();
    const filtered = response.data.filter((pool) => pool.chain.toLowerCase() === chainLower);
    return { data: filtered };
  }

  return response;
}

/**
 * Get all protocols with TVL data
 */
export async function getProtocols(): Promise<Protocol[]> {
  return fetchDefillama<Protocol[]>(
    "https://api.llama.fi/protocols",
    "protocols:all",
    protocolCache
  );
}

/**
 * Get specific protocol data
 * @param protocol - Protocol slug/name (e.g., "uniswap", "aave")
 */
export async function getProtocol(protocol: string): Promise<Protocol> {
  const cacheKey = `protocol:${protocol.toLowerCase()}`;
  return fetchDefillama<Protocol>(
    `https://api.llama.fi/protocol/${encodeURIComponent(protocol)}`,
    cacheKey,
    protocolCache
  );
}

/**
 * Get all chains with TVL data
 */
export async function getChains(): Promise<Chain[]> {
  return fetchDefillama<Chain[]>(
    "https://api.llama.fi/v2/chains",
    "chains:all",
    protocolCache
  );
}

/**
 * Get historical TVL for a specific chain
 * @param chain - Chain name (e.g., "Ethereum", "Base")
 */
export async function getChainHistoricalTvl(chain: string): Promise<HistoricalTvl[]> {
  const cacheKey = `chain:tvl:${chain.toLowerCase()}`;
  return fetchDefillama<HistoricalTvl[]>(
    `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(chain)}`,
    cacheKey,
    protocolCache
  );
}

/**
 * Helper: Convert CoinGecko ID to DeFiLlama format
 */
export function coingeckoIdToDefillama(coinId: string): string {
  return `coingecko:${coinId}`;
}

/**
 * Helper: Convert token address to DeFiLlama format
 */
export function tokenToDefillama(chain: string, address: string): string {
  return `${chain.toLowerCase()}:${address.toLowerCase()}`;
}

/**
 * Helper: Map common token symbols to DeFiLlama identifiers
 */
const COMMON_TOKENS: Record<string, string> = {
  ETH: "coingecko:ethereum",
  WETH: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  USDC: "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7",
  DAI: "ethereum:0x6b175474e89094c44da98b954eedeac495271d0f",
  WBTC: "ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  BTC: "coingecko:bitcoin",
  CBBTC: "coingecko:coinbase-wrapped-bitcoin",
  EURC: "coingecko:euro-coin",
  // Base network tokens
  "BASE:USDC": "base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "BASE:ETH": "coingecko:ethereum",
  "BASE:CBBTC": "base:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
};

export function getCommonTokenId(symbol: string): string | null {
  return COMMON_TOKENS[symbol.toUpperCase()] || null;
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
export function formatPercentChange(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return "0.00%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "0.00%";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

/**
 * Search for pools containing specific tokens
 * This is a helper that searches yield pools for token pairs
 */
export async function searchPoolsByTokens(
  token1Symbol: string,
  token2Symbol: string,
  chain?: string
): Promise<YieldPool[]> {
  const pools = await getYieldPools(chain);

  const symbol1 = token1Symbol.toUpperCase();
  const symbol2 = token2Symbol.toUpperCase();

  // Filter pools that contain both tokens in their symbol
  const matchingPools = pools.data.filter((pool) => {
    const poolSymbol = pool.symbol.toUpperCase();
    return poolSymbol.includes(symbol1) && poolSymbol.includes(symbol2);
  });

  // Sort by TVL descending
  return matchingPools.sort((a, b) => b.tvlUsd - a.tvlUsd);
}

/**
 * Get trending pools by chain (highest APY or TVL)
 * @param chain - Chain name
 * @param sortBy - Sort criteria: "apy" | "tvl" | "volume"
 * @param limit - Number of pools to return
 */
export async function getTrendingPools(
  chain: string,
  sortBy: "apy" | "tvl" | "volume" = "tvl",
  limit = 10
): Promise<YieldPool[]> {
  const pools = await getYieldPools(chain);

  let sorted: YieldPool[];
  if (sortBy === "apy") {
    sorted = pools.data.sort((a, b) => b.apy - a.apy);
  } else if (sortBy === "volume") {
    sorted = pools.data.sort((a, b) => (b.volumeUsd1d || 0) - (a.volumeUsd1d || 0));
  } else {
    sorted = pools.data.sort((a, b) => b.tvlUsd - a.tvlUsd);
  }

  return sorted.slice(0, limit);
}

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearAllCaches(): void {
  priceCache.clear();
  poolCache.clear();
  protocolCache.clear();
}
