import { useEffect, useMemo, useRef, useState } from "react";

type UseTokenUsdPricesResult = {
  prices: Record<string, number | null>;
  isLoading: boolean;
  error: string | null;
};

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  USDC: "usd-coin",
  CBBTC: "coinbase-wrapped-bitcoin",
  EURC: "euro-coin",
};

const FALLBACK_PRICES: Record<string, number> = {
  ETH: 3200,
  USDC: 1,
  CBBTC: 67000,
  EURC: 1.08,
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
      .map((symbol) => COINGECKO_IDS[symbol])
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

    const query = encodeURIComponent(ids.join(","));
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${query}&vs_currencies=usd`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Failed to load price data (status ${response.status})`);
        }
        return response.json() as Promise<Record<string, { usd?: number }>>;
      })
      .then((data) => {
        setPrices((prev) => {
          const next: Record<string, number | null> = { ...prev };
          symbols.forEach((symbol) => {
            const id = COINGECKO_IDS[symbol];
            if (!id) {
              next[symbol] = FALLBACK_PRICES[symbol] ?? null;
              return;
            }
            const price = data[id]?.usd ?? FALLBACK_PRICES[symbol] ?? null;
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
