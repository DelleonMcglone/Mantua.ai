import { SUPPORTED_NETWORKS, BASE_TOKENS, type SupportedNetwork } from "./config";

export interface ParsedQuery {
  type: keyof QueryParser["patterns"] | "unknown";
  network: string;
  params: Record<string, any>;
  originalQuery: string;
}

class QueryParser {
  readonly patterns = {
    topPools: /top\s+(?:(\d+)\s+)?pools?\s+(?:on\s+)?(\w+)/i,
    trendingPools: /trending\s+pools?\s+(?:on\s+)?(\w+)?/i,
    newPools: /new(?:est)?\s+pools?\s+(?:on\s+)?(\w+)?/i,
    poolsTrading: /pools?\s+(?:trading|with|for)\s+(\w+)/i,
    poolDetails: /(?:pool|liquidity)\s+(?:details?|info|data)\s+(?:for\s+)?(0x[a-fA-F0-9]{40})/i,
    chart: /chart\s+(?:for\s+)?(?:pool\s+)?(0x[a-fA-F0-9]{40})/i,
    priceChart: /price\s+chart\s+(?:for\s+)?(?:pool\s+)?(0x[a-fA-F0-9]{40})/i,
    volume: /(?:volume|trading\s+volume)\s+(?:for\s+)?(?:pool\s+)?(0x[a-fA-F0-9]{40})/i,
    liquidity: /liquidity\s+(?:in\s+)?(?:pool\s+)?(0x[a-fA-F0-9]{40})/i,
    tokenPrice: /(?:price|value)\s+(?:of\s+)?(\w+)\s+(?:on\s+)?(\w+)?/i,
    tokenInfo: /(?:info|information|data)\s+(?:about|for)\s+(\w+)/i,
    dexPools: /pools?\s+on\s+(\w+)\s+(?:dex|exchange)/i,
    uniswapPools: /uniswap\s+pools?\s+(?:on\s+)?(\w+)?/i,
  } as const;

  private readonly tokenSymbols: Record<string, string> = Object.entries(BASE_TOKENS).reduce(
    (map, [symbol, address]) => {
      map[symbol.toLowerCase()] = address;
      return map;
    },
    {} as Record<string, string>,
  );

  parse(query: string): ParsedQuery {
    const normalized = query.toLowerCase().trim();
    const network = this.extractNetwork(normalized) ?? "base";

    for (const [type, pattern] of Object.entries(this.patterns)) {
      const match = normalized.match(pattern);
      if (match) {
        return {
          type: type as ParsedQuery["type"],
          network,
          params: this.extractParams(type as keyof typeof this.patterns, match, normalized),
          originalQuery: query,
        };
      }
    }

    return {
      type: "unknown",
      network,
      params: {},
      originalQuery: query,
    };
  }

  private extractNetwork(query: string): string | null {
    for (const [key, config] of Object.entries(SUPPORTED_NETWORKS)) {
      const normalizedName = config.name.toLowerCase();
      if (query.includes(normalizedName) || query.includes(key)) {
        return key;
      }
    }
    return null;
  }

  private extractParams(
    type: keyof typeof this.patterns,
    match: RegExpMatchArray,
    normalized: string,
  ): Record<string, any> {
    switch (type) {
      case "topPools":
        return {
          limit: Number.parseInt(match[1] ?? "", 10) || 10,
          network: match[2] ?? null,
        };
      case "trendingPools":
      case "newPools":
        return { network: match[1] ?? null };
      case "poolsTrading": {
        const tokenSymbol = match[1]?.toLowerCase();
        return {
          token: tokenSymbol,
          tokenAddress: tokenSymbol ? this.tokenSymbols[tokenSymbol] ?? null : null,
        };
      }
      case "poolDetails":
      case "chart":
      case "priceChart":
      case "volume":
      case "liquidity":
        return { poolAddress: match[1] };
      case "tokenPrice":
      case "tokenInfo": {
        const symbol = match[1]?.toLowerCase();
        return {
          token: symbol,
          tokenAddress: symbol ? this.tokenSymbols[symbol] ?? null : null,
          network: match[2] ?? null,
        };
      }
      case "dexPools":
      case "uniswapPools":
        return {
          dex: type === "uniswapPools" ? "uniswap-v3" : match[1],
          network: match[1] ?? null,
        };
      default:
        return {};
    }
  }

  extractContractAddress(query: string): string | null {
    const match = query.match(/0x[a-fA-F0-9]{40}/);
    return match ? match[0] : null;
  }

  hasContractAddress(query: string): boolean {
    return /0x[a-fA-F0-9]{40}/.test(query);
  }
}

export default new QueryParser();
