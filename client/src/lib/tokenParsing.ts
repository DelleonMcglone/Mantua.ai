import { TOKENS } from "@/constants/tokens";

export function canonicalizeTokenSymbol(symbol: string): string {
  const normalized = symbol?.trim();
  if (!normalized) return symbol;
  const lower = normalized.toLowerCase();
  const matched = TOKENS.find((token) => token.symbol.toLowerCase() === lower);
  if (matched) return matched.symbol;
  return normalized.toUpperCase();
}

export function extractTokensFromText(text: string) {
  if (!text) return undefined;
  const raw = text.toLowerCase();

  const pairMatch = raw.match(/([a-z0-9]+)\s*\/\s*([a-z0-9]+)/);
  if (pairMatch) {
    const tokenA = canonicalizeTokenSymbol(pairMatch[1]);
    const tokenB = canonicalizeTokenSymbol(pairMatch[2]);
    if (tokenA && tokenB) {
      return { tokenA, tokenB };
    }
  }

  type Located = { symbol: string; index: number };
  const located: Located[] = [];

  for (const token of TOKENS) {
    const needle = token.symbol.toLowerCase();
    const regex = new RegExp(`\\b${needle}\\b`, "i");
    const match = raw.match(regex);
    if (match?.index !== undefined) {
      located.push({ symbol: token.symbol, index: match.index });
    }
  }

  if (!located.length) return undefined;

  located.sort((a, b) => a.index - b.index);
  const uniqueSymbols = located
    .map((item) => item.symbol)
    .filter((symbol, index, arr) => arr.indexOf(symbol) === index);

  if (!uniqueSymbols.length) return undefined;

  const [tokenA, tokenB] = uniqueSymbols;
  return { tokenA, tokenB };
}
