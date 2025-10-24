import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useUserPools } from "@/hooks/useUserPools";

type SwapExecutionResult = {
  status: "success" | "failed";
  hash?: `0x${string}`;
};

// File purpose: Execute swaps and handle post-tx updates.
export function useSwapExecution() {
  const balances = useTokenBalances();
  const pools = useUserPools();
  const { toast } = useToast();

  const executeSwap = useCallback(
    async <T extends SwapExecutionResult>(swapFn: () => Promise<T>) => {
      const receipt = await swapFn();
      if (receipt?.status === "success") {
        await Promise.allSettled([
          balances?.refetch?.(),
          pools?.refetch?.(),
        ]);
        toast({
          title: "Swap complete",
          description: "Portfolio updated with latest balances.",
        });
      }
      return receipt;
    },
    [balances, pools, toast],
  );

  return { executeSwap };
}
