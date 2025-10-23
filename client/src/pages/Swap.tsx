import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ArrowUpDown, Settings, ChevronUp, TrendingUp, Zap, CheckCircle } from "lucide-react";
import { useActivity } from "@/contexts/ActivityContext";
import { useActiveAccount } from "thirdweb/react";
import { useBalance } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import token logos
import ethereumLogo from '@assets/Frame 352 (1)_1758910668532.png';
import usdcLogo from '@assets/Frame 352_1758910679715.png';
import cbbtcLogo from '@assets/Frame 352 (2)_1758910679714.png';
import eurcLogo from '@assets/Frame 352 (3)_1758910679715.png';

interface Token {
  symbol: string;
  name: string;
  logo?: string;
}

const BASE_TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: ethereumLogo },
  { symbol: 'USDC', name: 'USD Coin', logo: usdcLogo },
  { symbol: 'cbBTC', name: 'Coinbase Bitcoin', logo: cbbtcLogo },
  { symbol: 'EURC', name: 'Euro Coin', logo: eurcLogo },
  { symbol: 'WETH', name: 'Wrapped Ether' },
  { symbol: 'DAI', name: 'Dai Stablecoin' },
]; // SWAP FIX: Prefill & Wallet Balance

const HOOK_OPTIONS = [
  { value: 'no-hook', label: 'No Hook' },
  { value: 'dynamic-fee', label: 'Dynamic fee hook' },
  { value: 'twamm', label: 'TWAMM hook' },
  { value: 'mev-protection', label: 'MEV protection hook' },
  { value: 'custom', label: 'Custom hook' }
];

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
}

interface SwapResultPayload {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  transactionHash: string;
}

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
}: SwapProps = {}) {
  const [sellToken, setSellToken] = useState(initialSellToken ?? "");
  const [buyToken, setBuyToken] = useState(initialBuyToken ?? "");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedHook, setSelectedHook] = useState(initialSelectedHook || 'no-hook');
  const [tokenOptions, setTokenOptions] = useState<Token[]>(BASE_TOKENS); // SWAP FIX: Prefill & Wallet Balance
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [showSwapDetails, setShowSwapDetails] = useState(false);
  const [transactionState, setTransactionState] = useState<'idle' | 'swapping' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  
  // Show custom hook section if initially requested
  const [showCustomHook, setShowCustomHook] = useState(initialShowCustomHook || initialSelectedHook === 'custom');
  const [hookWarningMessage, setHookWarningMessage] = useState(initialHookWarning ?? ""); // SWAP: display unresolved hook guidance
  const [isCustomHookModalOpen, setIsCustomHookModalOpen] = useState(shouldOpenCustomHookModal); // SWAP: custom hook loader modal state
  const customModalConfirmedRef = useRef(false); // SWAP: track modal confirmation intent
  
  // Activity tracking
  const { addUserActivity } = useActivity();
  const explorerBaseUrl =
    import.meta.env.MODE === "production"
      ? "https://basescan.org/tx/"
      : "https://sepolia-explorer.base.org/tx/"; // SWAP: align explorer links with environment
  const account = useActiveAccount();
  const nativeBalanceQuery = useBalance({
    address: account?.address as `0x${string}` | undefined,
    query: {
      enabled: Boolean(account?.address),
      refetchInterval: 15000,
    },
  }); // SWAP FIX: Prefill & Wallet Balance

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

  const swapTitle =
    sellToken && buyToken ? `Swap ${sellToken} for ${buyToken}` : "Set up your swap"; // SWAP FIX: clarify empty state
  const sellBalanceLabel = sellToken ? `${sellTokenBalance} ${sellToken}` : "—"; // SWAP FIX: sanitize balance display
  const buyBalanceLabel = buyToken ? `${buyTokenBalance} ${buyToken}` : "—"; // SWAP FIX: sanitize balance display
  const canUseSellMax =
    Boolean(sellToken) && !Number.isNaN(Number(sellTokenBalance)) && Number(sellTokenBalance) > 0; // SWAP FIX: gate max control
  const shouldShowDetails = Boolean(sellToken && buyToken); // SWAP FIX: defer details until tokens selected

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
    (symbol: string): Token => {
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

  const renderTokenBadge = (token: Token) => (
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

  const handleMaxClick = () => {
    if (!sellToken) return; // SWAP FIX: guard empty-state max
    const numericBalance = Number(sellTokenBalance);
    if (!sellTokenBalance || Number.isNaN(numericBalance) || numericBalance <= 0) return;
    setSellAmount(sellTokenBalance);
  }; // SWAP FIX: Prefill & Wallet Balance

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

  const handleSwapSubmit = async () => {
    if (transactionState !== 'idle') return;
    
    setTransactionState('swapping');
    const mockTransactionHash = '0x1234567890abcdef...';
    
    // Simulate swap initiation
    setTimeout(() => {
      setTransactionState('processing');
      setTransactionHash(mockTransactionHash);
      
      // Simulate transaction processing
      setTimeout(() => {
        setTransactionState('completed');
        
        // Add activity to tracking
        addUserActivity({
          type: 'Swap',
          assets: `${sellToken} to ${buyToken}`,
          amounts: `${sellAmount} ${sellToken}`,
          value: buyAmount.replace('$', ''),
          date: new Date().toISOString().split('T')[0],
          status: 'Completed'
        });

        onSwapSuccess?.({
          sellToken,
          buyToken,
          sellAmount,
          buyAmount: buyAmount.replace(/^\$/, ''),
          transactionHash: mockTransactionHash,
        }); // SWAP: mirror confirmation into chat history
      }, 5000);
    }, 2000);
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
  }; // SWAP FIX: Prefill & Wallet Balance

  // If transaction completed, show success screen
  if (transactionState === 'completed') {
    return (
      <div className={`${inlineMode ? 'w-full p-4 space-y-4' : 'max-w-md mx-auto p-6 space-y-4'}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Swapped {sellAmount} {sellToken} to {buyToken}
            </h2>
            <p className="text-foreground mb-2">Transaction successful!</p>
            <p className="text-sm text-muted-foreground">
              You have received {buyAmount} {buyToken}.{' '}
              <a 
                href={`${explorerBaseUrl}${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                data-testid="link-view-transaction"
              >
                View Transaction →
              </a>
            </p>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={resetSwap}
          className="w-full"
          data-testid="button-new-swap"
        >
          New Swap
        </Button>
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
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-swap-title">
          {swapTitle}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Sell Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Sell</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {sellBalanceLabel}
              </span>
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxClick}
                disabled={!canUseSellMax}
                data-testid="button-max"
              >
                Max
              </Button>
            </div>
            
            {/* SWAP FIX: Prefill & Wallet Balance - removed static sell token helper */}
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
              <span className="text-sm text-muted-foreground">
                Balance: {buyBalanceLabel}
              </span>
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
                <SelectValue placeholder="Select a hook..." />
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

      {/* Swap Details Panel */}
      {shouldShowDetails && (
        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => setShowSwapDetails(!showSwapDetails)}
              className="w-full flex items-center justify-between p-2"
              data-testid="button-swap-details"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">1 USDC = 0.00032 ETH</span>
                <span className="text-xs text-muted-foreground">($1.00)</span>
              </div>
              {showSwapDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showSwapDetails && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex justify-between items-center" data-testid="row-price-impact">
                  <span className="text-sm text-muted-foreground">Price impact</span>
                  <span className="text-sm font-medium">~0.2%</span>
                </div>
                
                <div className="flex justify-between items-center" data-testid="row-slippage">
                  <span className="text-sm text-muted-foreground">Max. slippage</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">Auto</Badge>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center" data-testid="row-fee">
                  <span className="text-sm text-muted-foreground">Fee (0.25%)</span>
                  <span className="text-sm font-medium">$0.77</span>
                </div>
                
                <div className="flex justify-between items-center" data-testid="row-network-cost">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Network cost</span>
                  </div>
                  <span className="text-sm font-medium">$22.04</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="space-y-3">
        <Button 
          onClick={handleSwapSubmit}
          disabled={transactionState !== 'idle'}
          className={`w-full text-base font-medium ${
            transactionState === 'swapping' ? 'bg-gradient-to-r from-primary to-primary/80' : ''
          }`}
          size="lg"
          data-testid="button-submit-swap"
        >
          {transactionState === 'idle' && 'Submit swap'}
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
                  <span className="text-sm font-medium">Transaction processing...</span>
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
