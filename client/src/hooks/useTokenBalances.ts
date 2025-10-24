import { useCallback, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { baseSepolia as thirdwebBaseSepolia } from "thirdweb/chains";
import { TOKENS, TOKENS_BY_SYMBOL, type TokenConfig } from "@/constants/tokens";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { baseSepolia } from "viem/chains";

export type TokenBalance = {
  symbol: string;
  name: string;
  address?: `0x${string}`;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
  isNative: boolean;
  logo?: string;
};

type TokenBalancesState = {
  tokens: TokenBalance[];
  lastUpdated: number;
  isFetching: boolean;
  error?: string;
  chainId?: number;
  address?: string;
};

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

let tokenBalancesSnapshot: TokenBalancesState = {
  tokens: [],
  lastUpdated: 0,
  isFetching: false,
  chainId: thirdwebBaseSepolia.id,
};

const tokenBalanceSubscribers = new Set<(state: TokenBalancesState) => void>();

function notifyTokenBalanceSubscribers() {
  tokenBalanceSubscribers.forEach((subscriber) => subscriber(tokenBalancesSnapshot));
}

function setTokenBalanceSnapshot(partial: Partial<TokenBalancesState>) {
  tokenBalancesSnapshot = {
    ...tokenBalancesSnapshot,
    ...partial,
  };
  notifyTokenBalanceSubscribers();
}

function getTrackedTokenConfigs(): TokenConfig[] {
  const baseConfigs = [...TOKENS];
  const knownSymbols = new Set(baseConfigs.map((token) => token.symbol));

  for (const token of tokenBalancesSnapshot.tokens) {
    if (!knownSymbols.has(token.symbol)) {
      knownSymbols.add(token.symbol);
      baseConfigs.push({
        symbol: token.symbol,
        name: token.name,
        logo: token.logo ?? "",
        address: token.address,
        decimals: token.decimals,
        chainId: tokenBalancesSnapshot.chainId,
      });
    }
  }

  return baseConfigs;
}

async function loadErc20Balances(address: string): Promise<TokenBalance[]> {
  const trackedConfigs = getTrackedTokenConfigs().filter(
    (token) =>
      token.address &&
      (!token.chainId || token.chainId === thirdwebBaseSepolia.id),
  );

  if (trackedConfigs.length === 0) {
    return [];
  }

  const results = await Promise.allSettled<TokenBalance>(
    trackedConfigs.map(async (token): Promise<TokenBalance> => {
      const decimals =
        typeof token.decimals === "number"
          ? token.decimals
          : await publicClient.readContract({
              address: token.address!,
              abi: erc20Abi,
              functionName: "decimals",
            });

      const [name, symbol] = await Promise.all([
        token.name
          ? Promise.resolve(token.name)
          : publicClient.readContract({
              address: token.address!,
              abi: erc20Abi,
              functionName: "name",
            }),
        token.symbol
          ? Promise.resolve(token.symbol)
          : publicClient.readContract({
              address: token.address!,
              abi: erc20Abi,
              functionName: "symbol",
            }),
      ]);

      const balanceRaw = (await publicClient.readContract({
        address: token.address!,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      })) as bigint;

      return {
        symbol: String(symbol),
        name: String(name),
        address: token.address,
        decimals: Number(decimals),
        balanceRaw,
        balance: formatUnits(balanceRaw, Number(decimals)),
        logo: token.logo,
        isNative: false,
      } as TokenBalance;
    }),
  );

  return results
    .filter((result): result is PromiseFulfilledResult<TokenBalance> => result.status === "fulfilled")
    .map((result) => result.value)
    .sort((a, b) => {
      const aBalance = Number(a.balance);
      const bBalance = Number(b.balance);
      if (aBalance === bBalance) {
        return a.symbol.localeCompare(b.symbol);
      }
      return bBalance - aBalance;
    });
}

async function fetchTokenBalancesForAddress(address?: string | null) {
  if (!address) {
    setTokenBalanceSnapshot({
      tokens: [],
      lastUpdated: Date.now(),
      isFetching: false,
      error: undefined,
      address: undefined,
    });
    return;
  }

  const normalizedAddress = address.toLowerCase();
  if (tokenBalancesSnapshot.isFetching && tokenBalancesSnapshot.address === normalizedAddress) {
    return;
  }

  setTokenBalanceSnapshot({
    isFetching: true,
    error: undefined,
    address: normalizedAddress,
    chainId: thirdwebBaseSepolia.id,
  });

  try {
    const [nativeBalance, tokenBalances] = await Promise.all([
      publicClient.getBalance({ address: normalizedAddress as `0x${string}` }),
      loadErc20Balances(normalizedAddress),
    ]);

    const nativeToken: TokenBalance | null = nativeBalance > 0n
      ? {
          symbol: "ETH",
          name: TOKENS_BY_SYMBOL.ETH?.name ?? "Ethereum",
          decimals: 18,
          address: undefined,
          isNative: true,
          balanceRaw: nativeBalance,
          balance: formatUnits(nativeBalance, 18),
          logo: TOKENS_BY_SYMBOL.ETH?.logo,
        }
      : null;

    const filteredTokens = tokenBalances.filter((token) => {
      const numericBalance = Number(token.balance);
      return Number.isFinite(numericBalance) && numericBalance > 0;
    });

    const combinedTokens = [
      ...(nativeToken ? [nativeToken] : []),
      ...filteredTokens,
    ];

    setTokenBalanceSnapshot({
      tokens: combinedTokens,
      lastUpdated: Date.now(),
      isFetching: false,
      error: undefined,
      address: normalizedAddress,
    });
  } catch (error) {
    console.error("[useTokenBalances] Failed to fetch balances", error);
    setTokenBalanceSnapshot({
      tokens: tokenBalancesSnapshot.tokens,
      lastUpdated: Date.now(),
      isFetching: false,
      error: error instanceof Error ? error.message : "Failed to load balances",
      address: normalizedAddress,
    });
  }
}

export function useTokenBalances() {
  const account = useActiveAccount();
  const [state, setState] = useState<TokenBalancesState>(tokenBalancesSnapshot);

  useEffect(() => {
    tokenBalanceSubscribers.add(setState);
    return () => {
      tokenBalanceSubscribers.delete(setState);
    };
  }, []);

  useEffect(() => {
    fetchTokenBalancesForAddress(account?.address);
  }, [account?.address]);

  const refetch = useCallback(async () => {
    await fetchTokenBalancesForAddress(account?.address);
  }, [account?.address]);

  return { ...state, refetch };
}
