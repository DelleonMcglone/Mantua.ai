import type { PoolResponse } from "./GeckoTerminalService";

export interface FormattedResponse<T = any> {
  success: boolean;
  title?: string;
  message?: string;
  summary?: Record<string, number>;
  data?: T;
  visualization?: "table" | "card" | "chart";
  highlightField?: string;
  error?: Error | unknown;
}

class ResponseFormatter {
  format(result: any, parsed: any): FormattedResponse {
    if (!result || result.error) {
      return this.formatError(result);
    }

    switch (result.type) {
      case "poolList":
        return this.formatPoolList(result);
      case "poolDetails":
        return this.formatPoolDetails(result);
      case "chart":
        return this.formatChart(result);
      case "tokenInfo":
        return this.formatTokenInfo(result);
      default:
        return { success: true, data: result.data };
    }
  }

  private formatPoolList(result: any): FormattedResponse<ReturnType<ResponseFormatter["formatPoolData"]>[]> {
    const { data, network, isTrending, isNew, token, dex } = result;
    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        message: "No pools found matching your criteria.",
      };
    }

    const pools = data.map((pool: PoolResponse) => this.formatPoolData(pool));

    let title = "";
    if (isTrending) {
      title = `Trending Pools${network ? ` on ${this.capitalize(network)}` : ""}`;
    } else if (isNew) {
      title = `Newest Pools${network ? ` on ${this.capitalize(network)}` : ""}`;
    } else if (token) {
      title = `Pools Trading ${String(token).toUpperCase()}`;
    } else if (dex) {
      title = `Top Pools on ${this.capitalize(dex)}`;
    } else {
      title = `Top ${pools.length} Pools on ${this.capitalize(network)}`;
    }

    return {
      success: true,
      title,
      message: this.generatePoolMessage(pools),
      summary: this.generatePoolSummary(pools),
      data: pools,
      visualization: "table",
    };
  }

  private formatPoolDetails(result: any): FormattedResponse<ReturnType<ResponseFormatter["formatPoolData"]>> {
    const { data, network, focus } = result;
    const attrs = data.attributes;

    let emoji = "📊";
    if (focus === "volume") emoji = "💵";
    if (focus === "liquidity") emoji = "💧";

    const formattedPool = this.formatPoolData(data);
    const message = `${emoji} **${attrs.name}**\n\n` +
      `Network: ${this.capitalize(network)}\n` +
      `Price: $${this.formatNumber(attrs.base_token_price_usd)}\n` +
      `24h Volume: $${this.formatLargeNumber(attrs.volume_usd?.h24 ?? 0)}\n` +
      `Liquidity: $${this.formatLargeNumber(attrs.reserve_in_usd)}\n` +
      `24h Change: ${this.formatChange(attrs.price_change_percentage?.h24)}\n` +
      `DEX: ${attrs.dex_id}\n` +
      `Transactions (24h): ${attrs.transactions?.h24?.buys ?? 0} buys / ${
        attrs.transactions?.h24?.sells ?? 0
      } sells`;

    return {
      success: true,
      title: attrs.name,
      message,
      data: formattedPool,
      visualization: "card",
      highlightField: focus,
    };
  }

  private formatChart(result: any): FormattedResponse<{ ohlcv: any[]; poolAddress: string; network: string; }> {
    const { data, poolAddress, network } = result;
    const ohlcvData = data.attributes.ohlcv_list;
    const formatted = ohlcvData.map((item: [number, number, number, number, number, number]) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
    }));

    return {
      success: true,
      title: "Pool Price Chart",
      message: `Here's the 7-day hourly price chart for the pool on ${this.capitalize(network)}`,
      data: {
        ohlcv: formatted,
        poolAddress,
        network,
      },
      visualization: "chart",
    };
  }

  private formatTokenInfo(result: any): FormattedResponse<Record<string, any>> {
    const { data, network } = result;
    const attrs = data.attributes;

    const message = `**${attrs.name} (${attrs.symbol})**\n\n` +
      `Price: $${this.formatNumber(attrs.price_usd)}\n` +
      `Market Cap: $${this.formatLargeNumber(attrs.market_cap_usd ?? 0)}\n` +
      `24h Volume: $${this.formatLargeNumber(attrs.volume_usd?.h24 ?? 0)}\n` +
      `24h Change: ${this.formatChange(attrs.price_change_percentage?.h24)}\n` +
      `Network: ${this.capitalize(network)}`;

    return {
      success: true,
      title: `${attrs.name} (${attrs.symbol})`,
      message,
      data: attrs,
      visualization: "card",
    };
  }

  private formatError(result: any): FormattedResponse {
    return {
      success: false,
      message: result?.message ?? "An error occurred while processing your request.",
      error: result?.error,
    };
  }

  private formatPoolData(pool: PoolResponse) {
    const attrs = pool.attributes;
    return {
      name: attrs.name,
      address: attrs.address,
      priceUsd: this.safeNumber(attrs.base_token_price_usd),
      priceChange24h: this.safeNumber(attrs.price_change_percentage?.h24),
      volume24h: this.safeNumber(attrs.volume_usd?.h24),
      liquidity: this.safeNumber(attrs.reserve_in_usd),
      fdv: this.safeNumber(attrs.fdv_usd),
      txns24h: attrs.transactions?.h24,
      poolCreatedAt: attrs.pool_created_at,
      dex: attrs.dex_id,
    };
  }

  private generatePoolMessage(pools: ReturnType<ResponseFormatter["formatPoolData"]>[]): string {
    return pools
      .slice(0, 5)
      .map((pool, index) =>
        `#${index + 1} ${pool.name} - $${this.formatNumber(pool.priceUsd)}\n` +
        `Vol: $${this.formatLargeNumber(pool.volume24h)} | Liq: $${this.formatLargeNumber(pool.liquidity)} | ` +
        `${this.formatChange(pool.priceChange24h)}`,
      )
      .join("\n\n");
  }

  private generatePoolSummary(pools: ReturnType<ResponseFormatter["formatPoolData"]>[]) {
    const totalVolume = pools.reduce((sum, pool) => sum + (pool.volume24h ?? 0), 0);
    const totalLiquidity = pools.reduce((sum, pool) => sum + (pool.liquidity ?? 0), 0);
    const avgPriceChange = pools.length
      ? pools.reduce((sum, pool) => sum + (pool.priceChange24h ?? 0), 0) / pools.length
      : 0;

    return {
      count: pools.length,
      totalVolume,
      totalLiquidity,
      avgPriceChange,
    };
  }

  private formatChange(change: number | string | undefined) {
    const num = this.safeNumber(change);
    const emoji = num >= 0 ? "🟢" : "🔴";
    const sign = num >= 0 ? "+" : "";
    return `${emoji} ${sign}${num.toFixed(2)}%`;
  }

  private capitalize(value?: string) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private formatNumber(value?: number) {
    const num = this.safeNumber(value);
    if (num >= 1) {
      return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  }

  private formatLargeNumber(value?: number) {
    const num = this.safeNumber(value);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(2);
  }

  private safeNumber(value: number | string | undefined | null): number {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    return Number.isFinite(num) ? Number(num) : 0;
  }
}

export default new ResponseFormatter();
