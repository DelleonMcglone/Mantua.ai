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
