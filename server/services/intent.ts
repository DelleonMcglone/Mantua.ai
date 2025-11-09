export type IntentType =
  | "swap"
  | "add_liquidity"
  | "analyze"
  | "agent_action"
  | "unknown";

export interface ParsedIntent {
  intent: IntentType;
  params: Record<string, unknown>;
}

const HOOK_KEYWORDS: Record<string, string> = {
  "mev protection": "mev-protection",
  "dynamic fee": "dynamic-fee",
  "dynamic fees": "dynamic-fee",
  twamm: "twamm",
  "time weighted": "twamm",
  custom: "custom",
};

export function parseIntent(message: string): ParsedIntent {
  const trimmed = message?.trim();
  if (!trimmed) {
    return { intent: "unknown", params: {} };
  }

  const normalized = trimmed.toLowerCase();

  if (normalized.includes("agent") || normalized.includes("autonomous")) {
    return {
      intent: "agent_action",
      params: { raw: trimmed },
    };
  }

  if (
    normalized.startsWith("add liquidity") ||
    normalized.startsWith("provide liquidity") ||
    normalized.includes("add liquidity") ||
    normalized.includes("provide liquidity")
  ) {
    return parseAddLiquidityIntent(trimmed);
  }

  if (
    normalized.startsWith("swap") ||
    normalized.includes(" swap ") ||
    normalized.includes("swap ")
  ) {
    return parseSwapIntent(trimmed);
  }

  if (
    normalized.startsWith("analyze") ||
    normalized.includes("analyse") ||
    normalized.includes("market") ||
    normalized.includes("tvl")
  ) {
    return {
      intent: "analyze",
      params: { topic: trimmed },
    };
  }

  return {
    intent: "unknown",
    params: {},
  };
}

function parseSwapIntent(message: string): ParsedIntent {
  const swapRegex =
    /swap\s+(?:([0-9]+(?:\.[0-9]+)?)\s+)?([a-zA-Z0-9]+)\s+(?:to|for)\s+([a-zA-Z0-9]+)/i;
  const match = message.match(swapRegex);

  const params: Record<string, unknown> = {};

  if (match) {
    const amount = match[1];
    const tokenIn = match[2];
    const tokenOut = match[3];
    if (amount) params.amount = amount;
    if (tokenIn) params.tokenIn = tokenIn.toUpperCase();
    if (tokenOut) params.tokenOut = tokenOut.toUpperCase();
  } else {
    const tokens = extractTokens(message);
    if (tokens.tokenIn) params.tokenIn = tokens.tokenIn;
    if (tokens.tokenOut) params.tokenOut = tokens.tokenOut;
  }

  const hookId = parseHook(message);
  if (hookId) {
    params.hookId = hookId;
  }

  return {
    intent: "swap",
    params,
  };
}

function parseAddLiquidityIntent(message: string): ParsedIntent {
  const liquidityRegex =
    /(?:add|provide)\s+liquidity(?:\s+(?:to|into|for|in))?\s+([a-zA-Z0-9]+)[/ ]?([a-zA-Z0-9]+)?/i;
  const tokensPhraseRegex =
    /(?:with|using)\s+([a-zA-Z0-9]+)\s+(?:and|&)\s+([a-zA-Z0-9]+)/i;

  const params: Record<string, unknown> = {};
  const directMatch = message.match(liquidityRegex);
  const phraseMatch = message.match(tokensPhraseRegex);

  if (directMatch) {
    if (directMatch[1]) params.tokenA = directMatch[1].toUpperCase();
    if (directMatch[2]) params.tokenB = directMatch[2].toUpperCase();
  }

  if (phraseMatch) {
    if (!params.tokenA && phraseMatch[1]) {
      params.tokenA = phraseMatch[1].toUpperCase();
    }
    if (!params.tokenB && phraseMatch[2]) {
      params.tokenB = phraseMatch[2].toUpperCase();
    }
  }

  const hookId = parseHook(message);
  if (hookId) {
    params.hookId = hookId;
  }

  return {
    intent: "add_liquidity",
    params,
  };
}

function parseHook(message: string): string | undefined {
  const normalized = message.toLowerCase();
  for (const [keyword, hookId] of Object.entries(HOOK_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return hookId;
    }
  }

  const customMatch = normalized.match(/with\s+hook\s+(0x[a-f0-9]{40})/i);
  if (customMatch) {
    return customMatch[1];
  }

  return undefined;
}

function extractTokens(message: string): {
  tokenIn?: string;
  tokenOut?: string;
} {
  // Keywords to exclude from token extraction
  const EXCLUDED_KEYWORDS = new Set([
    'SWAP', 'ADD', 'LIQUIDITY', 'PROVIDE', 'WITH', 'HOOK',
    'CUSTOM', 'FOR', 'THE', 'AND', 'USING', 'INTO'
  ]);

  const candidates = message
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => {
      const upper = word.toUpperCase();
      return word.length >= 3 &&
             word.length <= 10 &&
             /^[a-zA-Z0-9]+$/.test(word) &&
             !EXCLUDED_KEYWORDS.has(upper);
    });

  const unique: string[] = [];
  for (const candidate of candidates) {
    const symbol = candidate.toUpperCase();
    if (!unique.includes(symbol)) {
      unique.push(symbol);
    }
    if (unique.length >= 3) break;
  }

  return {
    tokenIn: unique[0],
    tokenOut: unique[1],
  };
}
