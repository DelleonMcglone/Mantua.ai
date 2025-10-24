import { normalizeHook, HookConfig } from "@/lib/hookLibrary";
import { extractTokensFromText } from "@/lib/tokenParsing";

type BaseIntent = {
  type?: "swap" | "add_liquidity";
  tokenIn?: string;
  tokenOut?: string;
  hook?: HookConfig;
};

// File purpose: Parse free text → structured intent used by UI.
export function parseUserCommand(text: string): BaseIntent {
  const raw = text?.toLowerCase() ?? "";
  const intent: BaseIntent = {};

  if (/\b(add liquidity|provide liquidity|create pool)\b/.test(raw)) {
    intent.type = "add_liquidity";
  }
  if (/\b(swap|trade|exchange)\b/.test(raw)) {
    intent.type = "swap";
  }

  const tokens = extractTokensFromText(text);
  if (tokens?.tokenA) intent.tokenIn = tokens.tokenA;
  if (tokens?.tokenB) intent.tokenOut = tokens.tokenB;

  const hookMatch = raw.match(/\bwith ([a-z0-9\-\s]+?)( hook)?\b/);
  if (hookMatch?.[1]) {
    const hook = normalizeHook(hookMatch[1]);
    if (hook) {
      intent.hook = hook;
    }
  }

  return intent;
}
