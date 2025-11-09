import GeckoTerminalService from "./GeckoTerminalService";
import QueryParser, { type ParsedQuery } from "./QueryParser";
import ResponseFormatter, { type FormattedResponse } from "./ResponseFormatter";

class QueryHandler {
  async handleQuery(query: string): Promise<FormattedResponse> {
    try {
      const parsed = QueryParser.parse(query);
      const result = await this.routeQuery(parsed);
      return ResponseFormatter.format(result, parsed);
    } catch (error) {
      console.error("[GeckoTerminal] Query error", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unable to process your query.",
        error,
      };
    }
  }

  private async routeQuery(parsed: ParsedQuery): Promise<any> {
    const { type, network, params } = parsed;
    const effectiveNetwork = typeof params.network === "string" ? params.network : network;

    switch (type) {
      case "topPools": {
        const response = await GeckoTerminalService.getNetworkPools(effectiveNetwork, 1);
        return {
          type: "poolList",
          data: response.data.slice(0, params.limit ?? 10),
          network: effectiveNetwork,
        };
      }
      case "trendingPools": {
        const response = params.network
          ? await GeckoTerminalService.getNetworkTrendingPools(effectiveNetwork)
          : await GeckoTerminalService.getTrendingPools();
        return {
          type: "poolList",
          data: response.data,
          network: params.network ? effectiveNetwork : undefined,
          isTrending: true,
        };
      }
      case "newPools": {
        const response = params.network
          ? await GeckoTerminalService.getNetworkNewPools(effectiveNetwork)
          : await GeckoTerminalService.getNewPools();
        return {
          type: "poolList",
          data: response.data,
          network: params.network ? effectiveNetwork : undefined,
          isNew: true,
        };
      }
      case "poolsTrading": {
        if (!params.tokenAddress) {
          throw new Error(`Token "${params.token}" not recognized. Provide the contract address.`);
        }
        const response = await GeckoTerminalService.getTokenPools(effectiveNetwork, params.tokenAddress);
        return {
          type: "poolList",
          data: response.data,
          network: effectiveNetwork,
          token: params.token,
        };
      }
      case "poolDetails":
      case "volume":
      case "liquidity": {
        const response = await GeckoTerminalService.getPoolData(
          effectiveNetwork,
          params.poolAddress,
        );
        return {
          type: "poolDetails",
          data: response.data,
          network: effectiveNetwork,
          focus: type,
        };
      }
      case "chart":
      case "priceChart": {
        const response = await GeckoTerminalService.getPoolOHLCV(
          effectiveNetwork,
          params.poolAddress,
          "hour",
          { limit: 168 },
        );
        return {
          type: "chart",
          data: response.data,
          poolAddress: params.poolAddress,
          network: effectiveNetwork,
        };
      }
      case "tokenPrice":
      case "tokenInfo": {
        if (!params.tokenAddress) {
          throw new Error(`Token "${params.token}" not found. Provide the contract address.`);
        }
        const response = await GeckoTerminalService.getTokenData(effectiveNetwork, params.tokenAddress);
        return {
          type: "tokenInfo",
          data: response.data,
          network: effectiveNetwork,
        };
      }
      case "dexPools":
      case "uniswapPools": {
        const dexId = `${params.dex}-${effectiveNetwork}`;
        const response = await GeckoTerminalService.getDexPools(effectiveNetwork, dexId);
        return {
          type: "poolList",
          data: response.data,
          network: effectiveNetwork,
          dex: params.dex,
        };
      }
      default:
        throw new Error(
          "I couldn't understand that query. Try asking about top pools, trending pools, specific pools, or token prices.",
        );
    }
  }
}

export default new QueryHandler();
