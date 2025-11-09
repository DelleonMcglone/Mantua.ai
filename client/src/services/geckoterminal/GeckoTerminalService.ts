import BaseApiService from "./BaseApiService";
import { GECKOTERMINAL_CONFIG } from "./config";

type PoolAttributes = {
  name: string;
  address: string;
  base_token_price_usd?: string;
  price_change_percentage?: {
    h24?: string | number;
  };
  volume_usd?: {
    h24?: string | number;
  };
  reserve_in_usd?: string;
  fdv_usd?: string;
  transactions?: {
    h24?: {
      buys?: number;
      sells?: number;
    };
  };
  pool_created_at?: string;
  dex_id?: string;
};

type PoolResponse = {
  id: string;
  type: string;
  attributes: PoolAttributes;
};

type TokenResponse = {
  id: string;
  type: string;
  attributes: Record<string, any>;
};

type OhlcvResponse = {
  id: string;
  type: string;
  attributes: {
    ohlcv_list: [number, number, number, number, number, number][];
  };
};

type GeckoTerminalListResponse<T> = {
  data: T[];
  meta?: Record<string, any>;
};

type GeckoTerminalSingleResponse<T> = {
  data: T;
  meta?: Record<string, any>;
};

class GeckoTerminalService extends BaseApiService {
  constructor() {
    super(GECKOTERMINAL_CONFIG);
  }

  // Network endpoints
  getNetworks() {
    return this.makeRequest<GeckoTerminalListResponse<any>>("/networks");
  }

  getTrendingPools() {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>("/networks/trending_pools");
  }

  getNewPools() {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>("/networks/new_pools");
  }

  // Network-specific pools
  getNetworkPools(network: string, page = 1) {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(`/networks/${network}/pools`, {
      page,
    });
  }

  getNetworkTrendingPools(network: string) {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(
      `/networks/${network}/trending_pools`,
    );
  }

  getNetworkNewPools(network: string) {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(
      `/networks/${network}/new_pools`,
    );
  }

  getPoolData(network: string, poolAddress: string) {
    return this.makeRequest<GeckoTerminalSingleResponse<PoolResponse>>(
      `/networks/${network}/pools/${poolAddress}`,
    );
  }

  getMultiplePoolsData(network: string, poolAddresses: string | string[]) {
    const addresses = Array.isArray(poolAddresses) ? poolAddresses.join(",") : poolAddresses;
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(
      `/networks/${network}/pools/multi/${addresses}`,
    );
  }

  // Token endpoints
  getTokenData(network: string, tokenAddress: string) {
    return this.makeRequest<GeckoTerminalSingleResponse<TokenResponse>>(
      `/networks/${network}/tokens/${tokenAddress}`,
    );
  }

  getTokenPools(network: string, tokenAddress: string, page = 1) {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(
      `/networks/${network}/tokens/${tokenAddress}/pools`,
      { page },
    );
  }

  getMultipleTokensData(network: string, tokenAddresses: string | string[]) {
    const addresses = Array.isArray(tokenAddresses) ? tokenAddresses.join(",") : tokenAddresses;
    return this.makeRequest<GeckoTerminalListResponse<TokenResponse>>(
      `/networks/${network}/tokens/multi/${addresses}`,
    );
  }

  getTokenPrice(network: string, tokenAddress: string) {
    return this.makeRequest<Record<string, number>>(
      `/simple/networks/${network}/token_price/${tokenAddress}`,
    );
  }

  // DEX endpoints
  getNetworkDexes(network: string) {
    return this.makeRequest<GeckoTerminalListResponse<any>>(`/networks/${network}/dexes`);
  }

  getDexPools(network: string, dex: string, page = 1) {
    return this.makeRequest<GeckoTerminalListResponse<PoolResponse>>(
      `/networks/${network}/dexes/${dex}/pools`,
      { page },
    );
  }

  // OHLCV
  getPoolOHLCV(
    network: string,
    poolAddress: string,
    timeframe: "day" | "hour" | "minute" = "hour",
    options: { aggregate?: number; limit?: number; currency?: "usd" | "token"; beforeTimestamp?: number } = {},
  ) {
    const params = {
      aggregate: options.aggregate ?? 1,
      limit: options.limit ?? 100,
      currency: options.currency ?? "usd",
      before_timestamp: options.beforeTimestamp,
    };

    return this.makeRequest<GeckoTerminalSingleResponse<OhlcvResponse>>(
      `/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}`,
      params,
    );
  }

  // Trades
  getPoolTrades(network: string, poolAddress: string) {
    return this.makeRequest<GeckoTerminalListResponse<any>>(
      `/networks/${network}/pools/${poolAddress}/trades`,
    );
  }

  // Helpers
  async getTopPoolsByVolume(network: string, limit = 10) {
    const response = await this.getNetworkPools(network, 1);
    return response.data.slice(0, limit);
  }

  async getTopPoolsByLiquidity(network: string, limit = 10) {
    const response = await this.getNetworkPools(network, 1);
    return response.data
      .slice()
      .sort((a, b) =>
        parseFloat(b.attributes.reserve_in_usd ?? "0") -
        parseFloat(a.attributes.reserve_in_usd ?? "0"),
      )
      .slice(0, limit);
  }

  searchPoolsByToken(network: string, tokenAddress: string) {
    return this.getTokenPools(network, tokenAddress, 1);
  }
}

export type { PoolResponse, PoolAttributes, TokenResponse, GeckoTerminalListResponse };

export default new GeckoTerminalService();
