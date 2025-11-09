import axios, { AxiosError } from "axios";
import Bottleneck from "bottleneck";
import NodeCache from "node-cache";
import { type GeckoTerminalConfig } from "./config";

type RequestParams = Record<string, string | number | boolean | undefined>;

class BaseApiService {
  private readonly baseUrl: string;
  private readonly cache: NodeCache;
  private readonly limiter: Bottleneck;

  constructor(config: GeckoTerminalConfig) {
    this.baseUrl = config.baseUrl;
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkperiod,
    });

    this.limiter = new Bottleneck({
      maxConcurrent: config.rateLimit.maxConcurrent,
      minTime: config.rateLimit.minTime,
    });
  }

  async makeRequest<T>(endpoint: string, params: RequestParams = {}): Promise<T> {
    const sanitizedParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    );
    const cacheKey = `${endpoint}-${JSON.stringify(sanitizedParams)}`;

    const cached = this.cache.get<T>(cacheKey);
    if (cached) {
      console.log("[GeckoTerminal] Cache hit", cacheKey);
      return cached;
    }

    console.log("[GeckoTerminal] Fetching", endpoint);

    try {
      const response = await this.limiter.schedule(() =>
        axios.get<T>(`${this.baseUrl}${endpoint}`, {
          params: sanitizedParams,
        }),
      );

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }
    return new Error("Network error. Please try again.");
  }

  private handleAxiosError(error: AxiosError<any>): Error {
    const status = error.response?.status;
    const data = error.response?.data as { error?: string } | undefined;

    if (status === 429) {
      return new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (status === 404) {
      return new Error("Resource not found. Please verify the pool or token address.");
    }
    if (status === 400) {
      return new Error(`Invalid request: ${data?.error ?? "Check your parameters."}`);
    }
    if (typeof status === "number") {
      return new Error(`API Error (${status}): ${data?.error ?? "Unknown error"}`);
    }

    return new Error("Network error. Please check your connection.");
  }

  clearCache(): void {
    this.cache.flushAll();
    console.log("[GeckoTerminal] Cache cleared");
  }
}

export default BaseApiService;
