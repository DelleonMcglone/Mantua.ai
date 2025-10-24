import { useCallback, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { baseSepolia as thirdwebBaseSepolia } from "thirdweb/chains";

export type UserPoolPosition = {
  id: string;
  chainId: number;
  tokenA: string;
  tokenB: string;
  amountTokenA?: string;
  amountTokenB?: string;
  lpTokenBalance?: string;
  updatedAt: string;
};

type UserPoolsState = {
  pools: UserPoolPosition[];
  lastUpdated: number;
  isFetching: boolean;
  error?: string;
  address?: string;
};

type PoolRecordInput = {
  tokenA: string;
  tokenB: string;
  amountTokenA?: string;
  amountTokenB?: string;
  lpTokenBalance?: string;
  chainId?: number;
};

const STORAGE_KEY = "mantua_user_pools";

let userPoolsSnapshot: UserPoolsState = {
  pools: [],
  lastUpdated: 0,
  isFetching: false,
};

const userPoolsSubscribers = new Set<(state: UserPoolsState) => void>();

function notifyUserPoolSubscribers() {
  userPoolsSubscribers.forEach((subscriber) => subscriber(userPoolsSnapshot));
}

function setUserPoolsSnapshot(partial: Partial<UserPoolsState>) {
  userPoolsSnapshot = {
    ...userPoolsSnapshot,
    ...partial,
  };
  notifyUserPoolSubscribers();
}

function readStorage(): Record<string, UserPoolPosition[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, UserPoolPosition[]>;
    return parsed ?? {};
  } catch (error) {
    console.error("[useUserPools] Failed to read storage", error);
    return {};
  }
}

function writeStorage(payload: Record<string, UserPoolPosition[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("[useUserPools] Failed to write storage", error);
  }
}

function computePoolId(chainId: number, tokenA: string, tokenB: string): string {
  const [left, right] = [tokenA.toUpperCase(), tokenB.toUpperCase()].sort();
  return `${chainId}:${left}-${right}`;
}

function loadPoolsForAddress(address: string): UserPoolPosition[] {
  const storage = readStorage();
  return storage[address] ?? [];
}

function persistPoolsForAddress(address: string, pools: UserPoolPosition[]) {
  const storage = readStorage();
  storage[address] = pools;
  writeStorage(storage);
}

async function fetchPoolsForAddress(address?: string | null) {
  if (!address) {
    setUserPoolsSnapshot({
      pools: [],
      lastUpdated: Date.now(),
      isFetching: false,
      error: undefined,
      address: undefined,
    });
    return;
  }

  const normalized = address.toLowerCase();
  setUserPoolsSnapshot({
    isFetching: true,
    address: normalized,
    error: undefined,
  });

  try {
    const pools = loadPoolsForAddress(normalized);
    setUserPoolsSnapshot({
      pools: sortPools(pools),
      lastUpdated: Date.now(),
      isFetching: false,
      error: undefined,
      address: normalized,
    });
  } catch (error) {
    console.error("[useUserPools] Failed to load pools", error);
    setUserPoolsSnapshot({
      pools: userPoolsSnapshot.pools,
      lastUpdated: Date.now(),
      isFetching: false,
      error: error instanceof Error ? error.message : "Failed to load pools",
      address: normalized,
    });
  }
}

function sortPools(pools: UserPoolPosition[]): UserPoolPosition[] {
  return [...pools].sort((a, b) => {
    const labelA = `${a.tokenA}/${a.tokenB}`;
    const labelB = `${b.tokenA}/${b.tokenB}`;
    if (labelA === labelB) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return labelA.localeCompare(labelB);
  });
}

function hasLiquidity(position: UserPoolPosition): boolean {
  const candidateValues = [
    position.amountTokenA,
    position.amountTokenB,
    position.lpTokenBalance,
  ]
    .filter(Boolean)
    .map((value) => Number(value));

  return candidateValues.some((value) => Number.isFinite(value) && value > 0);
}

export function useUserPools() {
  const account = useActiveAccount();
  const [state, setState] = useState<UserPoolsState>(userPoolsSnapshot);

  useEffect(() => {
    userPoolsSubscribers.add(setState);
    return () => {
      userPoolsSubscribers.delete(setState);
    };
  }, []);

  useEffect(() => {
    fetchPoolsForAddress(account?.address);
  }, [account?.address]);

  const refetch = useCallback(async () => {
    await fetchPoolsForAddress(account?.address);
  }, [account?.address]);

  const recordPosition = useCallback(
    (input: PoolRecordInput) => {
      const address = account?.address?.toLowerCase();
      if (!address) return;

      const chainId = input.chainId ?? thirdwebBaseSepolia.id;
      const normalizedTokenA = input.tokenA.toUpperCase();
      const normalizedTokenB = input.tokenB.toUpperCase();
      const poolId = computePoolId(chainId, normalizedTokenA, normalizedTokenB);
      const existingPools = loadPoolsForAddress(address);
      const existing = existingPools.find((pool) => pool.id === poolId);

      const nextPool: UserPoolPosition = {
        id: poolId,
        chainId,
        tokenA: normalizedTokenA,
        tokenB: normalizedTokenB,
        amountTokenA: input.amountTokenA ?? existing?.amountTokenA,
        amountTokenB: input.amountTokenB ?? existing?.amountTokenB,
        lpTokenBalance: input.lpTokenBalance ?? existing?.lpTokenBalance,
        updatedAt: new Date().toISOString(),
      };

      const liquidityPresent = hasLiquidity(nextPool);
      let nextPools: UserPoolPosition[];

      if (!liquidityPresent) {
        nextPools = existingPools.filter((pool) => pool.id !== poolId);
      } else if (existing) {
        nextPools = existingPools.map((pool) => (pool.id === poolId ? nextPool : pool));
      } else {
        nextPools = [...existingPools, nextPool];
      }

      persistPoolsForAddress(address, nextPools);
      setUserPoolsSnapshot({
        pools: sortPools(nextPools),
        lastUpdated: Date.now(),
        isFetching: false,
        error: undefined,
        address,
      });
    },
    [account?.address],
  );

  const removePosition = useCallback(
    (tokenA: string, tokenB: string, chainId = thirdwebBaseSepolia.id) => {
      const address = account?.address?.toLowerCase();
      if (!address) return;

      const poolId = computePoolId(chainId, tokenA, tokenB);
      const existingPools = loadPoolsForAddress(address);
      const nextPools = existingPools.filter((pool) => pool.id !== poolId);

      persistPoolsForAddress(address, nextPools);
      setUserPoolsSnapshot({
        pools: sortPools(nextPools),
        lastUpdated: Date.now(),
        isFetching: false,
        error: undefined,
        address,
      });
    },
    [account?.address],
  );

  return {
    ...state,
    refetch,
    recordPosition,
    removePosition,
  };
}
