import { useEffect, useMemo, useRef, useState } from "react";

type UseTokenUsdPricesResult = {
  prices: Record<string, number | null>;
  isLoading: boolean;
  error: string | null;
};

// DeFiLlama token identifiers (using coingecko: prefix for common tokens)
const DEFILLAMA_IDS: Record<string, string> = {
  ETH: "coingecko:ethereum",
  USDC: "coingecko:usd-coin",
  CBBTC: "coingecko:coinbase-wrapped-bitcoin",
  EURC: "coingecko:euro-coin",
  WETH: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  USDT: "coingecko:tether",
  DAI: "coingecko:dai",
};

const FALLBACK_PRICES: Record<string, number> = {
  ETH: 3200,
  USDC: 1,
  CBBTC: 67000,
  EURC: 1.08,
  WETH: 3200,
  USDT: 1,
  DAI: 1,
};

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function useTokenUsdPrices(tokens: Array<string | undefined>): UseTokenUsdPricesResult {
  const symbols = useMemo(() => {
    const unique = new Set<string>();
    tokens.forEach((token) => {
      if (!token) return;
      unique.add(normalizeSymbol(token));
    });
    return Array.from(unique);
  }, [tokens]);

  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      setPrices({});
      setIsLoading(false);
      setError(null);
      return;
    }

    const ids = symbols
      .map((symbol) => DEFILLAMA_IDS[symbol])
      .filter((id): id is string => Boolean(id));

    // Use fallback values if we do not recognize any ids
    if (ids.length === 0) {
      setPrices((prev) => {
        const next: Record<string, number | null> = { ...prev };
        symbols.forEach((symbol) => {
          next[symbol] = FALLBACK_PRICES[symbol] ?? null;
        });
        return next;
      });
      setIsLoading(false);
      setError("No matching price identifiers for the requested tokens.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const coinString = ids.join(",");
    fetch(
      `https://coins.llama.fi/prices/current/${coinString}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Failed to load price data (status ${response.status})`);
        }
        return response.json() as Promise<{ coins: Record<string, { price: number; decimals: number; symbol: string; timestamp: number }> }>;
      })
      .then((data) => {
        setPrices((prev) => {
          const next: Record<string, number | null> = { ...prev };
          symbols.forEach((symbol) => {
            const id = DEFILLAMA_IDS[symbol];
            if (!id) {
              next[symbol] = FALLBACK_PRICES[symbol] ?? null;
              return;
            }
            const priceData = data.coins[id];
            const price = priceData?.price ?? FALLBACK_PRICES[symbol] ?? null;
            next[symbol] = typeof price === "number" ? price : null;
          });
          return next;
        });
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error("[useTokenUsdPrices] Failed to fetch price data", fetchError);
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to fetch price data.",
        );
        setPrices((prev) => {
          const next: Record<string, number | null> = { ...prev };
          symbols.forEach((symbol) => {
            next[symbol] = FALLBACK_PRICES[symbol] ?? null;
          });
          return next;
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [symbols]);

  return {
    prices,
    isLoading,
    error,
  };
}
