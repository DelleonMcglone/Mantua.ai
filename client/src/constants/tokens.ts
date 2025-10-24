import ethereumLogo from "@assets/Frame 352 (1)_1758910668532.png";
import usdcLogo from "@assets/Frame 352_1758910679715.png";
import cbbtcLogo from "@assets/Frame 352 (2)_1758910679714.png";
import eurcLogo from "@assets/Frame 352 (3)_1758910679715.png";

export type TokenConfig = {
  symbol: string;
  name: string;
  logo: string;
  address?: `0x${string}`;
  decimals?: number;
  chainId?: number;
};

export const TOKENS: readonly TokenConfig[] = [
  { symbol: "ETH", name: "Ethereum", logo: ethereumLogo },
  { symbol: "USDC", name: "USD Coin", logo: usdcLogo, address: "0xf175520C52418DFe19C8098071a252da48Cd1C19", decimals: 6, chainId: 84532 },
  { symbol: "cbBTC", name: "Coinbase Bitcoin", logo: cbbtcLogo, decimals: 8, chainId: 84532 },
  { symbol: "EURC", name: "Euro Coin", logo: eurcLogo, address: "0xD9aAEc86B65D86f6A7B5A4307eA3D0eA1B3E2D51", decimals: 6, chainId: 84532 },
] as const;

export const TOKENS_BY_SYMBOL: Readonly<Record<string, TokenConfig>> = TOKENS.reduce(
  (acc, token) => {
    acc[token.symbol] = token;
    return acc;
  },
  {} as Record<string, TokenConfig>,
);

export function isKnownTokenSymbol(symbol?: string): boolean {
  if (!symbol) return false;
  return Boolean(TOKENS_BY_SYMBOL[symbol] ?? TOKENS_BY_SYMBOL[symbol.toUpperCase()] ?? TOKENS_BY_SYMBOL[symbol.toLowerCase()]);
}
