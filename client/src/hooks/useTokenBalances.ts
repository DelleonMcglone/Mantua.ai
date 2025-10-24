import { useCallback, useEffect, useState } from "react";

type TokenBalancesState = {
  lastUpdated: number;
};

let tokenBalancesSnapshot: TokenBalancesState = {
  lastUpdated: Date.now(),
};

const tokenBalanceSubscribers = new Set<(state: TokenBalancesState) => void>();

function notifyTokenBalanceSubscribers() {
  for (const subscriber of tokenBalanceSubscribers) {
    subscriber(tokenBalancesSnapshot);
  }
}

export function useTokenBalances() {
  const [state, setState] = useState<TokenBalancesState>(tokenBalancesSnapshot);

  useEffect(() => {
    tokenBalanceSubscribers.add(setState);
    return () => {
      tokenBalanceSubscribers.delete(setState);
    };
  }, []);

  const refetch = useCallback(async () => {
    tokenBalancesSnapshot = { lastUpdated: Date.now() };
    notifyTokenBalanceSubscribers();
  }, []);

  return { ...state, refetch };
}
