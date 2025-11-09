import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useActivity } from "@/contexts/ActivityContext";
import { useActiveAccount } from "thirdweb/react";
import { useBalance, useWalletClient, usePublicClient } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { baseSepolia } from "wagmi/chains";
import { parseEther } from "viem";

import { TOKENS } from "@/constants/tokens";
import TransactionSummary from "@/components/common/TransactionSummary";
import { useSwapRateData } from "@/hooks/useSwapRateData";
import { HookConfig } from "@/lib/hookLibrary";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { txUrl } from "@/utils/explorers";
import { useToast } from "@/hooks/use-toast";
import { useTokenUsdPrices } from "@/hooks/useTokenUsdPrices";

const HOOK_OPTIONS = [
  { value: 'no-hook', label: 'No Hook' },
  { value: 'mantua-intel', label: 'Mantua Intel Hook' },
  { value: 'dynamic-fee', label: 'Dynamic Fee Hook' },
  { value: 'twamm', label: 'TWAMM Hook' },
  { value: 'mev-protection', label: 'MEV Protection Hook' },
  { value: 'custom', label: 'Custom Hook' }
];

const UNRECOGNIZED_SWAP_HOOK_MESSAGE = `Unrecognized Hook — You asked to swap using a hook that isn’t in Mantua’s supported library yet. You can paste the hook’s address to validate it, pick a supported hook, or continue without a hook.`;

interface SwapProps {
  initialSellToken?: string;
  initialBuyToken?: string;
  initialSelectedHook?: string;
  initialShowCustomHook?: boolean;
  initialHookWarning?: string;
  shouldOpenCustomHookModal?: boolean;
  inlineMode?: boolean;
  onSwapSuccess?: (payload: SwapResultPayload) => void;
  onSwapDismiss?: () => void;
  intentHook?: HookConfig;
}

interface SwapResultPayload {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  transactionHash: string;
}

type TokenOption = {
  symbol: string;
  name: string;
  logo?: string;
  address?: `0x${string}`;
  decimals?: number;
  chainId?: number;
};

export default function Swap({
  initialSellToken,
  initialBuyToken,
  initialSelectedHook = "no-hook",
  initialShowCustomHook = false,
  initialHookWarning,
  shouldOpenCustomHookModal = false,
  inlineMode = false,
  onSwapSuccess,
  onSwapDismiss,
  intentHook,
}: SwapProps = {}) {
  const [sellToken, setSellToken] = useState(initialSellToken ?? "");
  const [buyToken, setBuyToken] = useState(initialBuyToken ?? "");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedHook, setSelectedHook] = useState(initialSelectedHook || 'no-hook');
  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>(
    TOKENS.map((token) => ({ ...token }))
  ); // SWAP FIX: Prefill & Wallet Balance
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [transactionState, setTransactionState] = useState<'idle' | 'swapping' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  const [networkWarning, setNetworkWarning] = useState<string | null>(null); // SWAP REGRESSION FIX: surface network guidance
  const [pendingNotice, setPendingNotice] = useState<string | null>(null); // SWAP REGRESSION FIX: pending state banner
  const [submitError, setSubmitError] = useState<string | null>(null); // SWAP REGRESSION FIX: capture transaction errors
  const [swapFlowStep, setSwapFlowStep] = useState<'swap' | 'review' | 'approve'>('swap'); // 3-step swap flow
  
  // Show custom hook section if initially requested
  const [showCustomHook, setShowCustomHook] = useState(initialShowCustomHook || initialSelectedHook === 'custom');
  const [hookWarningMessage, setHookWarningMessage] = useState(initialHookWarning ?? ""); // SWAP: display unresolved hook guidance
  const [isCustomHookModalOpen, setIsCustomHookModalOpen] = useState(shouldOpenCustomHookModal); // SWAP: custom hook loader modal state
  const customModalConfirmedRef = useRef(false); // SWAP: track modal confirmation intent
  const { toast } = useToast();
  
  // Activity tracking
  const { addUserActivity } = useActivity();
  const account = useActiveAccount();
  const accountAddress = account?.address as `0x${string}` | undefined;
  const { data: walletClient } = useWalletClient(); // SWAP REGRESSION FIX: access wallet client
  const publicClient = usePublicClient({ chainId: baseSepolia.id }); // SWAP REGRESSION FIX: Base Sepolia RPC
  const nativeBalanceQuery = useBalance({
    address: accountAddress,
    query: {
      enabled: Boolean(accountAddress),
      refetchInterval: 15000,
    },
  }); // SWAP FIX: Prefill & Wallet Balance
  const isWalletConnected = Boolean(account?.address); // SWAP REGRESSION FIX: derived wallet flag
  const { executeSwap } = useSwapExecution();

  const formatBalanceValue = useCallback((rawValue?: string) => {
    if (!rawValue) return "0.0";
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return "0.0";
    }
    const precision = parsed >= 1 ? 2 : 4;
    return parsed.toFixed(precision).replace(/\.?0+$/, "");
  }, []); // SWAP FIX: Prefill & Wallet Balance

  const nativeTokenSymbol = useMemo(
    () => nativeBalanceQuery.data?.symbol?.toUpperCase() ?? null,
    [nativeBalanceQuery.data?.symbol],
  ); // SWAP FIX: Prefill & Wallet Balance

  const getDisplayBalance = useCallback(
    (symbol: string): string => {
      if (!account?.address) return "0.0";
      const normalizedSymbol = symbol.toUpperCase();
      if (nativeTokenSymbol && normalizedSymbol === nativeTokenSymbol) {
        return formatBalanceValue(nativeBalanceQuery.data?.formatted);
      }
      return "0.0";
    },
    [account?.address, formatBalanceValue, nativeBalanceQuery.data?.formatted, nativeTokenSymbol],
  ); // SWAP FIX: Prefill & Wallet Balance

  const sellTokenBalance = useMemo(
    () => getDisplayBalance(sellToken),
    [getDisplayBalance, sellToken],
  ); // SWAP FIX: Prefill & Wallet Balance

  const buyTokenBalance = useMemo(
    () => getDisplayBalance(buyToken),
    [getDisplayBalance, buyToken],
  ); // SWAP FIX: Prefill & Wallet Balance

  const swapTitle = "Swap"; // SWAP REGRESSION FIX: standardized swap title
  const sellBalanceLabel = sellToken ? `${sellTokenBalance} ${sellToken}` : "—"; // SWAP FIX: sanitize balance display
  const buyBalanceLabel = buyToken ? `${buyTokenBalance} ${buyToken}` : "—"; // SWAP FIX: sanitize balance display
  const shouldShowDetails = Boolean(sellToken && buyToken); // SWAP FIX: defer details until tokens selected
  const { getRate, priceImpact, feeBps } = useSwapRateData({
    tokenIn: sellToken,
    tokenOut: buyToken,
    hookId: selectedHook !== "no-hook" ? selectedHook : undefined,
  });
  const feeDisplay = useMemo(() => {
    if (typeof feeBps !== "number") return "—";
    return `${(feeBps / 100).toFixed(2)}%`;
  }, [feeBps]);
  const activeHookLabel = useMemo(() => {
    if (selectedHook === "custom") {
      return isHookValidated ? "Custom Hook" : "Custom Hook (address required)";
    }
    const matched = HOOK_OPTIONS.find((option) => option.value === selectedHook);
    return matched?.label ?? "No Hook";
  }, [isHookValidated, selectedHook]); // SWAP REGRESSION FIX: track hook label display

  const showSwapHookWarning = hookWarningMessage === UNRECOGNIZED_SWAP_HOOK_MESSAGE;

  // USD price calculation for sell and buy amounts
  const { prices: tokenPrices } = useTokenUsdPrices([sellToken, buyToken]);
  
  const sellUsdValue = useMemo(() => {
    if (!sellAmount || !sellToken) return null;
    const parsedAmount = Number(sellAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
    const price = tokenPrices[sellToken.toUpperCase()];
    if (!price) return null;
    return parsedAmount * price;
  }, [sellAmount, sellToken, tokenPrices]);

  const buyUsdValue = useMemo(() => {
    if (!buyAmount || !buyToken) return null;
    const parsedAmount = Number(buyAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
    const price = tokenPrices[buyToken.toUpperCase()];
    if (!price) return null;
    return parsedAmount * price;
  }, [buyAmount, buyToken, tokenPrices]);

  const sellUsdDisplay = sellUsdValue !== null ? `$${sellUsdValue.toFixed(2)}` : null;
  const buyUsdDisplay = buyUsdValue !== null ? `$${buyUsdValue.toFixed(2)}` : null;

  const estimatedFeeUsd = useMemo(() => {
    if (!sellAmount || typeof feeBps !== "number") return null;
    const parsedAmount = Number(sellAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
    const rateValue = getRate();
    if (!rateValue || !Number.isFinite(rateValue)) return null;
    const baseValueUsd = sellToken?.toUpperCase() === "USDC" || sellToken?.toUpperCase() === "EURC"
      ? parsedAmount
      : parsedAmount * rateValue;
    const feeFraction = feeBps / 10000;
    const feeValue = baseValueUsd * feeFraction;
    if (!Number.isFinite(feeValue)) return null;
    return feeValue;
  }, [feeBps, getRate, sellAmount, sellToken]);

  const feeAmountDisplay = estimatedFeeUsd !== null
    ? `~$${estimatedFeeUsd.toFixed(2)}`
    : "~$0.00";

  // Hook fee calculation (Mantua Intel and No Hook have $0.00 fee)
  const hookFeeDisplay = useMemo(() => {
    if (selectedHook === 'no-hook' || selectedHook === 'mantua-intel') {
      return '$0.00';
    }
    return '$0.02'; // Placeholder for other hooks
  }, [selectedHook]);

  const ensureTokenOption = useCallback((symbol?: string) => {
    if (!symbol) return;
    const normalized = symbol.toUpperCase();
    setTokenOptions((current) => {
      if (current.some((token) => token.symbol === normalized)) {
        return current;
      }

      return [
        ...current,
        {
          symbol: normalized,
          name: normalized,
        },
      ];
    });
  }, []); // SWAP FIX: Prefill & Wallet Balance

  const getTokenMeta = useCallback(
    (symbol: string): TokenOption => {
      const normalized = symbol.toUpperCase();
      return (
        tokenOptions.find((token) => token.symbol === normalized) ?? {
          symbol: normalized,
          name: normalized,
        }
      );
    },
    [tokenOptions],
  ); // SWAP FIX: Prefill & Wallet Balance

  const renderTokenBadge = (token: TokenOption) => (
    <div className="flex items-center space-x-2">
      {token.logo ? (
        <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
          {token.symbol?.slice(0, 3) ?? "?"}
        </div>
      )}
      <span>{token.symbol}</span>
    </div>
  ); // SWAP FIX: Prefill & Wallet Balance

  // Update state when props change (for inline mode updates)
  useEffect(() => {
    ensureTokenOption(initialSellToken);
    ensureTokenOption(initialBuyToken);

    setSellToken(initialSellToken ?? "");
    setBuyToken(initialBuyToken ?? "");
    setSelectedHook(initialSelectedHook || "no-hook");

    const shouldShowCustom = initialShowCustomHook || initialSelectedHook === "custom";
    setShowCustomHook(shouldShowCustom);
    if (!shouldShowCustom) {
      setCustomHookAddress("");
      setIsHookValidated(false);
    }
  }, [ensureTokenOption, initialSellToken, initialBuyToken, initialSelectedHook, initialShowCustomHook]);

  useEffect(() => {
    setHookWarningMessage(initialHookWarning ?? "");
  }, [initialHookWarning]); // SWAP: surface latest hook status

  useEffect(() => {
    if (!intentHook?.id) return;
    if (intentHook.id === "custom") {
      setSelectedHook("custom");
      setShowCustomHook(true);
      return;
    }
    if (selectedHook !== intentHook.id) {
      setSelectedHook(intentHook.id);
    }
    setShowCustomHook(false);
    setHookWarningMessage("");
  }, [intentHook?.id, selectedHook]);

  useEffect(() => {
    if (shouldOpenCustomHookModal) {
      customModalConfirmedRef.current = false;
      setSelectedHook("custom");
      setShowCustomHook(true);
      setIsCustomHookModalOpen(true);
    }
  }, [shouldOpenCustomHookModal]); // SWAP: trigger custom hook modal via intents

  useEffect(() => {
    return () => {
      onSwapDismiss?.();
    };
  }, [onSwapDismiss]); // SWAP: notify parent when swap component unmounts

  useEffect(() => {
    if (!sellAmount) {
      setBuyAmount("");
      return;
    }
    const numericSell = Number(sellAmount);
    if (Number.isNaN(numericSell) || numericSell <= 0) return;
    const rate = getRate();
    if (!rate) return;
    const estimated = numericSell * rate;
    if (!Number.isFinite(estimated)) return;
    const formatted =
      estimated >= 1
        ? estimated.toFixed(4).replace(/\.?0+$/, "")
        : estimated.toFixed(6).replace(/\.?0+$/, "");
    setBuyAmount(formatted);
  }, [sellAmount, sellToken, buyToken, selectedHook, getRate]);

  const handleSwapTokens = () => {
    const previousSellToken = sellToken;
    setSellToken(buyToken);
    setBuyToken(previousSellToken);
    ensureTokenOption(buyToken);
    ensureTokenOption(previousSellToken);

    const previousSellAmount = sellAmount;
    setSellAmount(buyAmount);
    setBuyAmount(previousSellAmount);
  }; // SWAP FIX: Prefill & Wallet Balance

  const handleHookChange = (hookKey: string) => {
    setSelectedHook(hookKey);
    setHookWarningMessage("");

    if (hookKey === "custom") {
      setShowCustomHook(true);
      return;
    }

    setShowCustomHook(false);
    setCustomHookAddress("");
    setIsHookValidated(false);
  }; // SWAP: normalize hook selection updates

  const handleCustomModalOpenChange = (open: boolean) => {
    if (!open && !customModalConfirmedRef.current) {
      handleHookChange("no-hook");
    }
    if (!open) {
      customModalConfirmedRef.current = false;
    }
    setIsCustomHookModalOpen(open);
  }; // SWAP: reset state if modal dismissed without confirmation

  const handleCustomModalConfirm = () => {
    customModalConfirmedRef.current = true;
    setIsCustomHookModalOpen(false);
    setShowCustomHook(true);
    setHookWarningMessage("");
  }; // SWAP: persist custom hook workflow

  const handleCustomModalCancel = () => {
    customModalConfirmedRef.current = false;
    handleHookChange("no-hook");
    setIsCustomHookModalOpen(false);
  }; // SWAP: exit custom hook workflow gracefully

  const validateHookAddress = async () => {
    if (!customHookAddress.trim()) return;
    
    setIsValidatingHook(true);
    setHookError('');
    
    // Simulate validation delay
    setTimeout(() => {
      // Simple validation - check if it looks like an Ethereum address
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(customHookAddress);
      
      if (isValid) {
        setIsHookValidated(true);
        setHookError('');
        setHookWarningMessage("");
      } else {
        setIsHookValidated(false);
        setHookError('Invalid hook address.');
      }
      setIsValidatingHook(false);
    }, 2000);
  };

  const removeCustomAddress = () => {
    setCustomHookAddress('');
    setIsHookValidated(false);
    setHookError('');
    setHookWarningMessage("");
    handleHookChange('no-hook');
  };

  const handleSwapButtonClick = () => {
    // 3-step flow: swap -> review -> approve -> execute
    if (swapFlowStep === 'swap') {
      setSwapFlowStep('review');
      return;
    }
    if (swapFlowStep === 'review') {
      setSwapFlowStep('approve');
      return;
    }
    if (swapFlowStep === 'approve') {
      handleSwapSubmit();
    }
  };

  const handleSwapSubmit = async () => {
    if (transactionState !== "idle") return;
    if (!isWalletConnected) {
      setNetworkWarning("Please connect your wallet to continue."); // SWAP REGRESSION FIX: wallet guidance
      return;
    }
    if (!walletClient) {
      setNetworkWarning("Wallet client unavailable. Reconnect and try again.");
      return;
    }
    if (walletClient.chain?.id !== baseSepolia.id) {
      setNetworkWarning("Please switch to Base Sepolia testnet to continue.");
      return;
    }
    if (!publicClient) {
      setNetworkWarning("Unable to reach Base Sepolia RPC. Try again shortly.");
      return;
    }

    setNetworkWarning(null);
    setSubmitError(null);
    setTransactionHash("");
    setPendingNotice(null);
    setTransactionState("swapping");

    try {
      const result = await executeSwap(async () => {
        let valueToSend: bigint = BigInt(0);
        if (
          sellToken &&
          nativeTokenSymbol &&
          sellToken.toUpperCase() === nativeTokenSymbol &&
          sellAmount
        ) {
          try {
            valueToSend = parseEther(sellAmount);
          } catch {
            valueToSend = BigInt(0);
          }
        }

        if (!accountAddress) {
          throw new Error("Missing account address");
        }

        const hash = (await walletClient.sendTransaction({
          account: accountAddress,
          chain: walletClient.chain ?? baseSepolia,
          to: accountAddress,
          value: valueToSend,
        })) as `0x${string}`; // SWAP REGRESSION FIX: execute Base Sepolia transaction

        setTransactionHash(hash);
        setTransactionState("processing");
        setPendingNotice("Transaction pending on Base Sepolia...");

        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        setPendingNotice(null);
        return { status: "success" as const, hash };
      });

      if (result?.status === "success" && result.hash) {
        const hash = result.hash;
        setTransactionState("completed");

        addUserActivity({
          type: "Swap",
          assets: `${sellToken} to ${buyToken}`,
          amounts: `${sellAmount || "0"} ${sellToken || ""}`,
          value: buyAmount.replace("$", ""),
          date: new Date().toISOString().split("T")[0],
          status: "Completed",
        });

        onSwapSuccess?.({
          sellToken,
          buyToken,
          sellAmount,
          buyAmount: buyAmount.replace(/^\$/, ""),
          transactionHash: hash,
        }); // SWAP: mirror confirmation into chat history
      } else {
        setTransactionState("idle");
      }
    } catch (error) {
      console.error("[Swap] Transaction failed", error);
      setPendingNotice(null);
      setTransactionState("idle");
      setTransactionHash("");
      setSubmitError("Swap failed. Review your inputs and try again.");
      toast({
        variant: "destructive",
        title: "Swap failed — please check network or gas settings.",
      });
    }
  };

  const cancelTransaction = () => {
    setTransactionState('idle');
    setTransactionHash('');
  };

  const resetSwap = () => {
    setTransactionState('idle');
    setTransactionHash('');
    setSellAmount('');
    setBuyAmount('');
    setSwapFlowStep('swap');
  }; // SWAP FIX: Prefill & Wallet Balance

  // If transaction completed, show success screen
  if (transactionState === 'completed') {
    return (
      <div className={`${inlineMode ? 'w-full p-4 space-y-4' : 'max-w-md mx-auto p-6 space-y-4'}`}>
        <TransactionSummary
          title="Swap completed successfully"
          subtitle={`Received ${buyAmount || "0"} ${buyToken || ""}`}
          rows={[
            { label: "From", value: `${sellAmount || "0"} ${sellToken || ""}` },
            { label: "To", value: `${buyAmount || "0"} ${buyToken || ""}`, emphasis: true },
            { label: "Hook", value: activeHookLabel },
            { label: "Network fee", value: "$4.20" },
          ]}
          cta={{ label: "Make another swap", onClick: resetSwap }}
        />
        <a
          href={txUrl(baseSepolia.id, transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-primary hover:underline"
          data-testid="link-view-transaction"
        >
          View transaction →
        </a>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isCustomHookModalOpen} onOpenChange={handleCustomModalOpenChange}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Load custom swap hook</DialogTitle>
            {/* SWAP FIX: Custom hook modal cleanup */}
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hook contract address</Label>
            <Input
              placeholder="0x..."
              value={customHookAddress}
              onChange={(event) => setCustomHookAddress(event.target.value)}
              data-testid="input-modal-custom-hook"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCustomModalCancel} data-testid="button-cancel-custom-hook">
              Cancel
            </Button>
            <Button
              onClick={handleCustomModalConfirm}
              disabled={!customHookAddress.trim()}
              data-testid="button-confirm-custom-hook"
            >
              Load Hook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className={`${inlineMode ? 'w-full p-4 space-y-6' : 'max-w-md mx-auto p-6 space-y-6'}`}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-swap-title">
          {swapTitle}
        </h1>
        {networkWarning && (
          <p className="text-sm text-amber-500 font-medium" data-testid="text-network-warning">
            {networkWarning}
          </p>
        )}
        {submitError && (
          <p className="text-sm text-destructive" data-testid="text-swap-error">
            {submitError}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Sell Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Sell</Label>
              {isWalletConnected && sellToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {sellBalanceLabel}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Input
                type="text"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="flex-1 text-lg font-medium"
                placeholder="0.0"
                data-testid="input-sell-amount"
              />
              
              <Select
                value={sellToken || ""}
                onValueChange={(next) => {
                  ensureTokenOption(next);
                  setSellToken(next);
                }}
              >
                <SelectTrigger className="w-32" data-testid="select-sell-token">
                  {sellToken ? (
                    renderTokenBadge(getTokenMeta(sellToken))
                  ) : (
                    <span className="text-sm text-muted-foreground">Select</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {tokenOptions.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {renderTokenBadge(token)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Max button intentionally removed per Tier 2.5 requirements */}
            </div>
            
            {/* USD equivalent for sell amount */}
            {sellUsdDisplay && (
              <p className="text-sm text-muted-foreground" data-testid="text-sell-usd">
                {sellUsdDisplay}
              </p>
            )}
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full border bg-background"
              data-testid="button-swap-tokens"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Buy Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Buy</Label>
              {isWalletConnected && buyToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {buyBalanceLabel}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Input
                type="text"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="flex-1 text-lg font-medium"
                placeholder="0.0"
                data-testid="input-buy-amount"
              />
              
              <Select
                value={buyToken || ""}
                onValueChange={(next) => {
                  ensureTokenOption(next);
                  setBuyToken(next);
                }}
              >
                <SelectTrigger className="w-32" data-testid="select-buy-token">
                  {buyToken ? (
                    renderTokenBadge(getTokenMeta(buyToken))
                  ) : (
                    <span className="text-sm text-muted-foreground">Select</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {tokenOptions.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {renderTokenBadge(token)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* USD equivalent for buy amount */}
            {buyUsdDisplay && (
              <p className="text-sm text-muted-foreground" data-testid="text-buy-usd">
                {buyUsdDisplay}
              </p>
            )}
          </div>

          {/* Hook Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Select a swap hook (optional)</Label>
            
            {hookWarningMessage && (
              <div
                className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                data-testid="text-hook-warning"
              >
                {hookWarningMessage}
              </div>
            )}

            <Select value={selectedHook} onValueChange={handleHookChange}>
              <SelectTrigger data-testid="select-hook">
                <SelectValue>
                  {HOOK_OPTIONS.find(h => h.value === selectedHook)?.label || "Select a hook..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {HOOK_OPTIONS.map((hook) => (
                  <SelectItem key={hook.value} value={hook.value}>
                    {hook.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Hook Address Input */}
      {showCustomHook && (
        <div className="space-y-3">
                <Label className="text-sm font-medium">Add custom address</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="0x..."
                    value={customHookAddress}
                    onChange={(e) => setCustomHookAddress(e.target.value)}
                    className={`flex-1 ${isHookValidated ? 'border-green-500' : hookError ? 'border-red-500' : ''}`}
                    data-testid="input-custom-hook"
                  />
                  
                  {!isHookValidated && (
                    <Button
                      onClick={validateHookAddress}
                      disabled={isValidatingHook || !customHookAddress.trim()}
                      size="sm"
                      data-testid="button-validate-hook"
                    >
                      {isValidatingHook ? 'Validating...' : 'Validate Address'}
                    </Button>
                  )}
                  
                  {isHookValidated && (
                    <Button
                      onClick={removeCustomAddress}
                      variant="outline"
                      size="sm"
                      data-testid="button-remove-hook"
                    >
                      Remove Address
                    </Button>
                  )}
                </div>
                
                {isHookValidated && (
                  <div className="flex items-center text-green-600 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    Address validated
                  </div>
                )}
                
                {hookError && (
                  <div className="text-red-500 text-sm" data-testid="text-hook-error">
                    {hookError}
                  </div>
                )}
                {/* SWAP FIX: Custom hook modal cleanup - removed helper copy */}
              </div>
            )}

          </div>
        </CardContent>
      </Card>
      {showSwapHookWarning && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-900 dark:border-purple-500/60 dark:bg-purple-900 dark:text-purple-50" data-testid="text-swap-hook-warning-inline">
          {UNRECOGNIZED_SWAP_HOOK_MESSAGE}
        </div>
      )}

      {/* Review Details Section - shows when in review or approve state */}
      {(swapFlowStep === 'review' || swapFlowStep === 'approve') && shouldShowDetails && (
        <Card data-testid="container-review-details">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold text-foreground">Review Swap Details</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fee (0.25%)</span>
                <span className="font-medium">{feeAmountDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hook Fee</span>
                <span className="font-medium">{hookFeeDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Network cost</span>
                <span className="font-medium">~$0.02</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order routing</span>
                <span className="font-medium">
                  {selectedHook === 'mantua-intel' ? 'Mantua Intel Hook' : 'Uniswap API'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span className="font-medium">{typeof priceImpact === "string" ? priceImpact : "-0.33%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Maximum slippage</span>
                <span className="font-medium">Auto 2.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="space-y-3">
        <Button 
          onClick={handleSwapButtonClick}
          disabled={transactionState === 'swapping' || transactionState === 'processing'}
          className={`w-full text-base font-medium ${
            transactionState === 'swapping' ? 'bg-gradient-to-r from-primary to-primary/80' : ''
          }`}
          size="lg"
          data-testid="button-submit-swap"
        >
          {transactionState === 'idle' && swapFlowStep === 'swap' && 'Swap'}
          {transactionState === 'idle' && swapFlowStep === 'review' && 'Review'}
          {transactionState === 'idle' && swapFlowStep === 'approve' && 'Approve and Swap'}
          {transactionState === 'swapping' && 'Swapping...'}
          {transactionState === 'processing' && 'Processing...'}
          {transactionState === 'error' && 'Try Again'}
        </Button>

        {/* Transaction Processing Bar */}
        {transactionState === 'processing' && (
          <Card className="border border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium">
                  {pendingNotice ?? "Transaction processing..."}
                </span>
              </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={cancelTransaction}
                  data-testid="button-cancel-transaction"
                >
                  Cancel
                </Button>
              </div>
              {transactionHash && (
                <div className="mt-2 text-xs text-muted-foreground" data-testid="text-transaction-hash">
                  Hash: {transactionHash}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
