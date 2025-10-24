import { useCallback, useMemo } from "react";

type Params = {
  tokenIn?: string;
  tokenOut?: string;
  hookId?: string;
};

const DEFAULT_RATE = 1;

function buildKey(tokenIn?: string, tokenOut?: string) {
  if (!tokenIn || !tokenOut) return "";
  return `${tokenIn.toUpperCase()}->${tokenOut.toUpperCase()}`;
}

const STATIC_RATES: Record<string, number> = {
  "ETH->USDC": 3000,
  "USDC->ETH": 1 / 3000,
  "ETH->cbBTC": 0.045,
  "cbBTC->ETH": 1 / 0.045,
};

export function useSwapRateData({ tokenIn, tokenOut }: Params) {
  const rate = useMemo(() => {
    if (!tokenIn || !tokenOut || tokenIn === tokenOut) return undefined;
    const key = buildKey(tokenIn, tokenOut);
    return STATIC_RATES[key] ?? DEFAULT_RATE;
  }, [tokenIn, tokenOut]);

  const getRate = useCallback(() => rate, [rate]);

  const priceImpact = rate ? "0.10%" : "—";
  const feeBps = rate ? 30 : undefined;

  return { getRate, priceImpact, feeBps };
}
