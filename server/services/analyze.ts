type ChartPoint = {
  t: string;
  v: number;
};

type ChartType = "area" | "bar";

export interface AnalyzeResponse {
  summary: string;
  metrics: Record<string, unknown>[];
  chart?: {
    type?: ChartType;
    seriesLabel: string;
    points: ChartPoint[];
  };
  source?: string;
  topic?: string;
}

interface DefiLlamaChain {
  name: string;
  tvl: number;
  change_1d?: number | string | null;
  change_7d?: number | string | null;
}

interface DefiLlamaProtocol {
  name: string;
  tvl?: number;
  change_1d?: number | string | null;
  change_7d?: number | string | null;
  category?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "MantuaAI/1.0 (+https://mantua.ai)",
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Failed to fetch ${url} :: ${response.status} ${payload}`);
  }

  return (await response.json()) as T;
}

function toNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "0.00%";
  }
  const rounded = value.toFixed(2);
  return `${value >= 0 ? "+" : ""}${rounded}%`;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

async function fetchChains(): Promise<DefiLlamaChain[]> {
  return fetchJson<DefiLlamaChain[]>("https://api.llama.fi/v2/chains");
}

async function fetchProtocols(): Promise<DefiLlamaProtocol[]> {
  return fetchJson<DefiLlamaProtocol[]>("https://api.llama.fi/protocols");
}

async function fetchChainHistoryPoints(chainName: string, days = 7): Promise<ChartPoint[]> {
  try {
    const history = await fetchJson<Array<{ date: number; tvl: number }>>(
      `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(chainName)}`,
    );
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }
    const recent = history.slice(-days);
    return recent.map((entry) => ({
      t: new Date(entry.date * 1000).toISOString(),
      v: entry.tvl,
    }));
  } catch (error) {
    console.error(`[analyze] Failed to load history for ${chainName}`, error);
    return [];
  }
}

export async function analyzeQuestion(question: string): Promise<AnalyzeResponse> {
  const normalized = question.toLowerCase();

  // Check for pool-specific queries
  if (normalized.includes("pool") || normalized.includes("liquidity")) {
    // Import CoinGecko functions dynamically to avoid circular dependencies
    const { searchEthCbBtcPoolOnBase, getTrendingPoolsOnBase, formatUsd, formatPercentChange } = await import("./coingecko");
    
    if (normalized.includes("eth") && (normalized.includes("btc") || normalized.includes("cbbtc"))) {
      // Specific ETH/cbBTC pool query
      const poolData = await searchEthCbBtcPoolOnBase();
      if (!poolData.pools || poolData.pools.length === 0) {
        throw new Error("NO_DATA");
      }
      
      const topPool = poolData.topPool;
      const summary = `Found ${poolData.pools.length} ETH/cbBTC pools on Base network. Top pool has ${formatUsd(topPool.reserveUsd)} in liquidity with ${formatUsd(topPool.volume24h)} 24h volume.`;
      
      const metrics = poolData.pools.map((pool) => ({
        pool: pool.name,
        dex: pool.dex,
        reserveUsd: formatUsd(pool.reserveUsd),
        volume24h: formatUsd(pool.volume24h),
        priceChange24h: formatPercentChange(pool.priceChange24h),
      }));
      
      return {
        summary,
        metrics,
        source: "CoinGecko (GeckoTerminal)",
        topic: "eth_cbbtc_pools",
      };
    }
    
    if (normalized.includes("trending") || normalized.includes("top")) {
      // Trending pools on Base
      const trending = await getTrendingPoolsOnBase();
      if (!trending.data || trending.data.length === 0) {
        throw new Error("NO_DATA");
      }
      
      const topPools = trending.data.slice(0, 5);
      const summary = `Top ${topPools.length} trending pools on Base network show strong activity.`;
      
      const metrics = topPools.map((pool) => ({
        pool: pool.attributes.name,
        reserveUsd: formatUsd(pool.attributes.reserve_in_usd),
        volume24h: formatUsd(pool.attributes.volume_usd?.h24 || "0"),
        priceChange24h: formatPercentChange(pool.attributes.price_change_percentage?.h24),
      }));
      
      return {
        summary,
        metrics,
        source: "CoinGecko (GeckoTerminal)",
        topic: "trending_pools_base",
      };
    }
  }

  // Check for token price queries
  if (normalized.includes("price") || normalized.includes("token")) {
    const { getSimplePrice, formatUsd, formatPercentChange } = await import("./coingecko");
    
    // Extract common tokens from query
    const tokens = [];
    if (normalized.includes("eth") || normalized.includes("ethereum")) tokens.push("ethereum");
    if (normalized.includes("btc") || normalized.includes("bitcoin")) tokens.push("bitcoin");
    if (normalized.includes("usdc")) tokens.push("usd-coin");
    
    if (tokens.length > 0) {
      const prices = await getSimplePrice(tokens);
      const tokenNames = tokens.map(id => id.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()));
      const summary = `Current prices: ${tokenNames.join(", ")}`;
      
      const metrics = Object.entries(prices).map(([id, data]) => ({
        token: id.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
        price: formatUsd(data.usd || 0),
        change24h: formatPercentChange(data.usd_24h_change),
        volume24h: formatUsd(data.usd_24h_vol || 0),
        marketCap: formatUsd(data.usd_market_cap || 0),
      }));
      
      return {
        summary,
        metrics,
        source: "CoinGecko",
        topic: "token_prices",
      };
    }
  }

  if (normalized.includes("protocol")) {
    return analyzeProtocolMovers();
  }

  if (normalized.includes("chain") || normalized.includes("network")) {
    return analyzeChainMovers();
  }

  // Default to chain trends if no explicit qualifier is present.
  return analyzeChainMovers();
}

async function analyzeChainMovers(): Promise<AnalyzeResponse> {
  const chains = await fetchChains();
  const ranked = chains
    .map((chain) => ({
      name: chain.name,
      tvl: chain.tvl,
      change1d: toNumber(chain.change_1d),
      change7d: toNumber(chain.change_7d),
    }))
    .filter((chain) => chain.change7d !== null)
    .sort((a, b) => (b.change7d ?? 0) - (a.change7d ?? 0))
    .slice(0, 5);

  if (ranked.length === 0) {
    throw new Error("NO_DATA");
  }

  const leadersSummary = ranked
    .slice(0, 3)
    .map((chain) => `${chain.name} (${formatPercent(chain.change7d)})`)
    .join(", ")
    .replace(/, ([^,]*)$/, ", and $1");

  let summary = `${leadersSummary} led TVL growth this week.`;

  const leaderHistory = await fetchChainHistoryPoints(ranked[0].name);
  if (leaderHistory.length >= 2) {
    const start = leaderHistory[0].v;
    const end = leaderHistory[leaderHistory.length - 1].v;
    summary += ` ${ranked[0].name} TVL moved from ${formatUsd(start)} to ${formatUsd(end)} over the last ${leaderHistory.length}-day window.`;
  }

  const metrics = ranked.map((chain) => ({
    chain: chain.name,
    tvlUsd: chain.tvl,
    change1dPct: chain.change1d !== null ? Number(chain.change1d.toFixed(2)) : null,
    change7dPct: chain.change7d !== null ? Number(chain.change7d.toFixed(2)) : null,
  }));

  const chart = {
    type: "bar" as ChartType,
    seriesLabel: "7d TVL change (%)",
    points: ranked.map((chain) => ({
      t: chain.name,
      v: chain.change7d !== null ? Number(chain.change7d.toFixed(2)) : 0,
    })),
  };

  return {
    summary,
    metrics,
    chart,
    source: "DefiLlama",
    topic: "chain_tvl_growth",
  };
}

async function analyzeProtocolMovers(): Promise<AnalyzeResponse> {
  const protocols = await fetchProtocols();
  const ranked = protocols
    .map((protocol) => ({
      name: protocol.name,
      tvl: protocol.tvl ?? 0,
      change1d: toNumber(protocol.change_1d),
      change7d: toNumber(protocol.change_7d),
    }))
    .filter((protocol) => protocol.change7d !== null)
    .sort((a, b) => (b.change7d ?? 0) - (a.change7d ?? 0))
    .slice(0, 5);

  if (ranked.length === 0) {
    throw new Error("NO_DATA");
  }

  const leadersSummary = ranked
    .slice(0, 3)
    .map((protocol) => `${protocol.name} (${formatPercent(protocol.change7d)})`)
    .join(", ")
    .replace(/, ([^,]*)$/, ", and $1");

  const summary = `${leadersSummary} drove protocol-level TVL gains this week.`;

  const metrics = ranked.map((protocol) => ({
    protocol: protocol.name,
    tvlUsd: protocol.tvl,
    change1dPct: protocol.change1d !== null ? Number(protocol.change1d.toFixed(2)) : null,
    change7dPct: protocol.change7d !== null ? Number(protocol.change7d.toFixed(2)) : null,
  }));

  const chart = {
    type: "bar" as ChartType,
    seriesLabel: "Protocol 7d TVL change (%)",
    points: ranked.map((protocol) => ({
      t: protocol.name,
      v: protocol.change7d !== null ? Number(protocol.change7d.toFixed(2)) : 0,
    })),
  };

  return {
    summary,
    metrics,
    chart,
    source: "DefiLlama",
    topic: "protocol_tvl_movers",
  };
}
