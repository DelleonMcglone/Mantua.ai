export interface GeckoTerminalConfig {
  baseUrl: string;
  rateLimit: {
    maxConcurrent: number;
    minTime: number;
  };
  cache: {
    ttl: number;
    checkperiod: number;
  };
}

export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number | null;
  nativeToken: string;
}

export const GECKOTERMINAL_CONFIG: GeckoTerminalConfig = {
  baseUrl: "https://api.geckoterminal.com/api/v2",
  rateLimit: {
    maxConcurrent: 1,
    minTime: 2000,
  },
  cache: {
    ttl: 30,
    checkperiod: 60,
  },
};

export const SUPPORTED_NETWORKS = {
  base: {
    id: "base",
    name: "Base",
    chainId: 8453,
    nativeToken: "ETH",
  },
  ethereum: {
    id: "eth",
    name: "Ethereum",
    chainId: 1,
    nativeToken: "ETH",
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    chainId: 42161,
    nativeToken: "ETH",
  },
  solana: {
    id: "solana",
    name: "Solana",
    chainId: null,
    nativeToken: "SOL",
  },
  polygon: {
    id: "polygon_pos",
    name: "Polygon",
    chainId: 137,
    nativeToken: "MATIC",
  },
} as const satisfies Record<string, NetworkConfig>;

export type SupportedNetwork = keyof typeof SUPPORTED_NETWORKS;

export const BASE_TOKENS = {
  ETH: "0x4200000000000000000000000000000000000006",
  USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  DEGEN: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
  cbBTC: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
} as const;

export type BaseTokenSymbol = keyof typeof BASE_TOKENS;
