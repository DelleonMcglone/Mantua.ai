import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, X } from "lucide-react";
import { useActivity } from "@/contexts/ActivityContext";
import { useActiveAccount } from "thirdweb/react";
import { useBalance } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import { TOKENS, TOKENS_BY_SYMBOL } from "@/constants/tokens";
import { HookConfig } from "@/lib/hookLibrary";
import { txUrl } from "@/utils/explorers";
import TransactionSummary from "@/components/common/TransactionSummary";
import { useUserPools } from "@/hooks/useUserPools";

const FEE_TIERS = [
  { value: '0.01', label: '0.01% - best for very stable pairs' },
  { value: '0.05', label: '0.05% - best for stable pairs' },
  { value: '0.30', label: '0.30% - most common' },
  { value: '1.00', label: '1.00% - best for exotic pairs' }
];

const HOOK_OPTIONS = [
  { value: 'no-hook', label: 'No Hook' },
  { value: 'mantua-intel', label: 'Mantua Intel Hook' },
  { value: 'dynamic-fee', label: 'Dynamic Fee Hook' },
  { value: 'twamm', label: 'TWAMM Hook' },
  { value: 'mev-protection', label: 'MEV Protection Hook' },
  { value: 'custom', label: 'Custom Hook' }
];

const UNRECOGNIZED_LIQUIDITY_HOOK_MESSAGE = `You asked to Add Liquidity using a hook that isn't in Mantua's supported library yet.
You can paste the hook's address to validate it, pick a supported hook, or continue without a hook.`;

interface AddLiquidityProps {
  initialToken1?: string;
  initialToken2?: string;
  initialSelectedHook?: string;
  initialShowCustomHook?: boolean;
  poolName?: string;
  inlineMode?: boolean;
  intentHook?: HookConfig;
  initialHookWarning?: string;
}

export default function AddLiquidity({ 
  initialToken1,
  initialToken2,
  initialSelectedHook = 'no-hook',
  initialShowCustomHook = false,
  poolName,
  inlineMode = false,
  intentHook,
  initialHookWarning,
}: AddLiquidityProps = {}) {
  const [token1, setToken1] = useState(initialToken1 ?? '');
  const [token2, setToken2] = useState(initialToken2 ?? '');
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [feeTier, setFeeTier] = useState('0.30');
  const [selectedHook, setSelectedHook] = useState(initialSelectedHook || 'no-hook');
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [transactionState, setTransactionState] = useState<'idle' | 'adding' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [hookWarningMessage, setHookWarningMessage] = useState(initialHookWarning ?? "");

  const [showCustomHook, setShowCustomHook] = useState(initialShowCustomHook || initialSelectedHook === 'custom');
  const [rangeType, setRangeType] = useState<'full' | 'custom'>('full');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  
  const { addUserActivity } = useActivity();
  const userPools = useUserPools();
  const account = useActiveAccount();

  const token1Config = useMemo(() => (token1 ? TOKENS_BY_SYMBOL[token1] : undefined), [token1]);
  const token2Config = useMemo(() => (token2 ? TOKENS_BY_SYMBOL[token2] : undefined), [token2]);
  const isWalletConnected = Boolean(account?.address); // LIQUIDITY FIX: respond to wallet status

  const formatBalanceValue = useCallback((rawValue?: string) => {
    if (!rawValue) return "0.0";
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return "0.0";
    const precision = parsed >= 1 ? 2 : 4;
    return parsed.toFixed(precision).replace(/\.?0+$/, "");
  }, []); // LIQUIDITY FIX: normalize numeric formatting

  const token1BalanceQuery = useBalance({
    address: account?.address as `0x${string}` | undefined,
    token: token1Config?.address as `0x${string}` | undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(isWalletConnected && token1),
      refetchInterval: 15000,
    },
  });

  const token2BalanceQuery = useBalance({
    address: account?.address as `0x${string}` | undefined,
    token: token2Config?.address as `0x${string}` | undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(isWalletConnected && token2),
      refetchInterval: 15000,
    },
  });

  const token1BalanceValue =
    token1 && isWalletConnected
      ? formatBalanceValue(token1BalanceQuery.data?.formatted)
      : "0.0";
  const token2BalanceValue =
    token2 && isWalletConnected
      ? formatBalanceValue(token2BalanceQuery.data?.formatted)
      : "0.0";

  const canMaxToken1 = Boolean(token1) && Number(token1BalanceValue) > 0;
  const canMaxToken2 = Boolean(token2) && Number(token2BalanceValue) > 0;
  const hookStatusLabel = useMemo(() => {
    if (selectedHook === "custom") {
      return isHookValidated ? "Custom Hook" : "Custom Hook (validate address)";
    }
    const matched = HOOK_OPTIONS.find((option) => option.value === selectedHook);
    return matched?.label ?? "No Hook";
  }, [isHookValidated, selectedHook]); // LIQUIDITY REGRESSION FIX: hook status label
  const showHookWarning = hookWarningMessage === UNRECOGNIZED_LIQUIDITY_HOOK_MESSAGE;
  const isHookRecognized = !showHookWarning;

  useEffect(() => {
    setToken1(initialToken1 ?? "");
    setToken2(initialToken2 ?? "");
  }, [initialToken1, initialToken2]);

  useEffect(() => {
    setSelectedHook(initialSelectedHook || "no-hook");
    const shouldShowCustom = initialShowCustomHook || initialSelectedHook === "custom";
    setShowCustomHook(shouldShowCustom);
    if (!shouldShowCustom) {
      setCustomHookAddress("");
      setIsHookValidated(false);
    }
  }, [initialSelectedHook, initialShowCustomHook]);

  useEffect(() => {
    setHookWarningMessage(initialHookWarning ?? "");
  }, [initialHookWarning]);

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
    setIsHookValidated(false);
    setHookError("");
  }, [intentHook?.id, selectedHook]);

  const handleMaxClick = (tokenNumber: 1 | 2) => {
    if (tokenNumber === 1) {
      if (!canMaxToken1) return;
      setAmount1(token1BalanceValue);
      return;
    }
    if (!canMaxToken2) return;
    setAmount2(token2BalanceValue);
  }; // LIQUIDITY FIX: drive max controls from live balances

  const validateHookAddress = async () => {
    if (!customHookAddress.trim()) return;
    
    setIsValidatingHook(true);
    setHookError('');
    
    setTimeout(() => {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(customHookAddress);
      
      if (isValid) {
        setIsHookValidated(true);
        setHookError('');
        setHookWarningMessage('');
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
    setSelectedHook('no-hook');
    setHookWarningMessage('');
  };

  const onAddSuccess = async (hash: string) => {
    try {
      await userPools?.refetch?.();
    } catch (error) {
      console.error("[AddLiquidity] Failed to refresh pools", error);
    }
    setTransactionHash(hash);
    setShowSummary(true);
    setTransactionState('completed');
  };

  const handleAddLiquidity = async () => {
    if (!isHookRecognized) {
      return;
    }
    if (selectedHook === 'custom' && !isHookValidated) {
      setHookError('Please validate your custom hook address first.');
      return;
    }

    setShowSummary(false);
    setTransactionHash('');
    setTransactionState('adding');
    
    setTimeout(() => {
      setTransactionState('processing');
      const hash = `0x${Math.random().toString(16).substring(2, 42)}` as `0x${string}`;
      
      setTimeout(async () => {
        const token1Data = TOKENS.find(t => t.symbol === token1);
        const token2Data = TOKENS.find(t => t.symbol === token2);
        const sanitizedAmount1 = amount1 || '0.0';
        const sanitizedAmount2 = amount2 || '0.0';

        if (token1Data?.symbol && token2Data?.symbol) {
          userPools?.recordPosition?.({
            tokenA: token1Data.symbol,
            tokenB: token2Data.symbol,
            amountTokenA: sanitizedAmount1,
            amountTokenB: sanitizedAmount2,
          });
        }

        await onAddSuccess(hash);

        addUserActivity({
          type: 'Liquidity',
          assets: `${token1Data?.symbol} / ${token2Data?.symbol}`,
          amounts: `${sanitizedAmount1} ${token1Data?.symbol} + ${sanitizedAmount2} ${token2Data?.symbol}`,
          value: `$${(Number(sanitizedAmount1) + Number(sanitizedAmount2)).toFixed(2)}`,
          date: new Date().toLocaleDateString(),
          status: 'Completed'
        });
      }, 3000);
    }, 2000);
  };

  const handleAddMore = () => {
    setTransactionState('idle');
    setAmount1('');
    setAmount2('');
    setCustomHookAddress('');
    setIsHookValidated(false);
    setShowSummary(false);
    setTransactionHash('');
    setHookWarningMessage('');
  };

  if (transactionState === 'completed' && showSummary) {
    const token1Data = TOKENS.find(t => t.symbol === token1);
    const token2Data = TOKENS.find(t => t.symbol === token2);
    const sanitizedAmount1 = amount1 || '0.0';
    const sanitizedAmount2 = amount2 || '0.0';
    const totalValue = Number(sanitizedAmount1) + Number(sanitizedAmount2);

    return (
      <div className={`${inlineMode ? 'w-full p-4 space-y-4' : 'max-w-md mx-auto p-6 space-y-4'}`} data-testid="liquidity-success-screen">
        <TransactionSummary
          title="Liquidity added successfully"
          subtitle={`Added ${sanitizedAmount1} ${token1Data?.symbol ?? token1} and ${sanitizedAmount2} ${token2Data?.symbol ?? token2}`}
          rows={[
            { label: 'Add Liquidity', value: `${sanitizedAmount1} ${token1Data?.symbol ?? token1} + ${sanitizedAmount2} ${token2Data?.symbol ?? token2}` },
            { label: 'Total Value', value: `$${totalValue.toFixed(2)}` },
            { label: 'Hook', value: selectedHook === 'no-hook' ? 'No Hook' : hookStatusLabel },
            { label: 'Pool Share', value: '0.00% (est.)', emphasis: true },
            { label: 'Network fee', value: '$4.20' },
          ]}
          cta={{ label: 'Add more liquidity', onClick: handleAddMore }}
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

  const token1Data = TOKENS.find(t => t.symbol === token1);
  const token2Data = TOKENS.find(t => t.symbol === token2);

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" data-testid="text-add-liquidity-title">
          {poolName || "Add liquidity to a pool."}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Token 1</Label>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="text"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              className="flex-1"
              placeholder="0.0"
              data-testid="input-token1-amount"
            />
            
            <Select value={token1 || ""} onValueChange={setToken1}>
              <SelectTrigger className="w-32" data-testid="select-token1">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol} data-testid={`select-item-${token.symbol.toLowerCase()}`}>
                    <div className="flex items-center gap-2">
                      <img src={token.logo} alt={token.symbol} className="w-5 h-5" />
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMaxClick(1)}
              disabled={!canMaxToken1}
              data-testid="button-max-token1"
            >
              Max
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Token 2</Label>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="text"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              className="flex-1"
              placeholder="0.0"
              data-testid="input-token2-amount"
            />
            
            <Select value={token2 || ""} onValueChange={setToken2}>
              <SelectTrigger className="w-32" data-testid="select-token2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol} data-testid={`select-item-${token.symbol.toLowerCase()}-2`}>
                    <div className="flex items-center gap-2">
                      <img src={token.logo} alt={token.symbol} className="w-5 h-5" />
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMaxClick(2)}
              disabled={!canMaxToken2}
              data-testid="button-max-token2"
            >
              Max
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Fee tiers</Label>
            <Select value={feeTier} onValueChange={setFeeTier}>
              <SelectTrigger data-testid="select-fee-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEE_TIERS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value} data-testid={`select-item-fee-${tier.value}`}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select a hook (optional)</Label>
            <Select 
              value={selectedHook} 
              onValueChange={(value) => {
                setSelectedHook(value);
                setShowCustomHook(value === 'custom');
                setHookWarningMessage('');
                if (value !== 'custom') {
                  setCustomHookAddress('');
                  setIsHookValidated(false);
                  setHookError('');
                }
              }}
            >
              <SelectTrigger data-testid="select-hook">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOOK_OPTIONS.map((hook) => (
                  <SelectItem key={hook.value} value={hook.value} data-testid={`select-item-hook-${hook.value}`}>
                    {hook.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCustomHook && selectedHook === 'custom' && (
            <div className="space-y-2">
              <Label>Add custom address</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customHookAddress}
                    onChange={(e) => {
                      setCustomHookAddress(e.target.value);
                      setIsHookValidated(false);
                      setHookError('');
                    }}
                    placeholder="0x..."
                    className="flex-1"
                    data-testid="input-custom-hook"
                  />
                  <Button 
                    onClick={validateHookAddress}
                    disabled={!customHookAddress || isValidatingHook}
                    data-testid="button-validate-hook"
                  >
                    {isValidatingHook ? 'Validating...' : 'Validate address'}
                  </Button>
                </div>
                
                {isHookValidated && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10 text-green-500" data-testid="message-hook-validated">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Address validated
                    </span>
                    <button onClick={removeCustomAddress} className="hover:opacity-70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {hookError && (
                  <p className="text-sm text-destructive" data-testid="message-hook-error">{hookError}</p>
                )}
              </div>
            </div>
          )}

          {hookWarningMessage && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 whitespace-pre-line" data-testid="text-liquidity-hook-warning">
              {hookWarningMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Price Range Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-lg" data-testid="text-price-range-title">Set price range</h3>

          {/* Range Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setRangeType('full')}
              variant={rangeType === 'full' ? 'default' : 'outline'}
              className={`flex-1 ${
                rangeType === 'full' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                  : ''
              }`}
              data-testid="button-full-range"
            >
              Full range
            </Button>
            <Button
              type="button"
              onClick={() => setRangeType('custom')}
              variant={rangeType === 'custom' ? 'default' : 'outline'}
              className={`flex-1 ${
                rangeType === 'custom' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                  : ''
              }`}
              data-testid="button-custom-range"
            >
              Custom range
            </Button>
          </div>

          {/* Description Text */}
          {rangeType === 'full' ? (
            <p className="text-sm text-muted-foreground" data-testid="text-full-range-description">
              Providing full range liquidity ensures continuous market participation across all possible prices, 
              offering simplicity but with potential for higher impermanent loss.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground" data-testid="text-custom-range-description">
              Custom range allows you to concentrate your liquidity within specific price bounds, 
              enhancing capital efficiency and fee earnings but requiring more active management.
            </p>
          )}

          {/* Current Price Display */}
          <div className="bg-card border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current price</p>
              <h4 className="font-bold text-lg mt-1" data-testid="text-current-price">3,638.71</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {token1 && token2 ? `${token1}/${token2}` : 'ETH/USDC'} ($3,638.71)
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-muted px-3 py-1 rounded-lg text-sm font-medium" data-testid="badge-token1">
                {token1 || 'ETH'}
              </div>
              <div className="bg-muted px-3 py-1 rounded-lg text-sm font-medium" data-testid="badge-token2">
                {token2 || 'USDC'}
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gradient-to-t from-purple-900/20 via-background to-background rounded-lg mt-4 h-40 relative border">
            <p className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm" data-testid="text-chart-placeholder">
              Price Range Chart Visualization
            </p>
          </div>

          {/* Min/Max Price Inputs (Custom Range Only) */}
          {rangeType === 'custom' && (
            <div className="flex gap-3 mt-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">Min price</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-card"
                  data-testid="input-min-price"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">Max price</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-card"
                  data-testid="input-max-price"
                />
              </div>
            </div>
          )}

          {/* Time Range Selector + Reset */}
          <div className="flex justify-between items-center text-sm mt-3">
            <div className="flex gap-3">
              {['1D', '1W', '1M', '1Y', 'All time'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedTimeRange(range)}
                  className={`${
                    selectedTimeRange === range
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`button-time-${range.toLowerCase().replace(' ', '-')}`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setRangeType('full');
                setMinPrice('');
                setMaxPrice('');
                setSelectedTimeRange('1M');
              }}
              className="text-primary hover:underline"
              data-testid="button-reset-range"
            >
              Reset
            </button>
          </div>
        </CardContent>
      </Card>

      <Button 
        className={`w-full ${
          transactionState === 'adding' ? 'bg-gradient-to-r from-primary to-primary/80' : ''
        }`}
        size="lg"
        disabled={transactionState !== 'idle'}
        onClick={handleAddLiquidity}
        data-testid="button-add-liquidity"
      >
        {transactionState === 'idle' && 'Add liquidity'}
        {transactionState === 'adding' && 'Adding liquidity...'}
        {transactionState === 'processing' && 'Processing...'}
        {transactionState === 'error' && 'Try Again'}
      </Button>

      {transactionState === 'processing' && (
        <Card className="border border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" data-testid="text-processing">Transaction processing...</span>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="button-cancel-processing"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-2">
          <h3 className="font-medium mb-3">Estimated earnings</h3>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fee tier:</span>
            <span className="font-medium" data-testid="text-estimated-fee">{feeTier}%</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pool:</span>
            <span className="font-medium" data-testid="text-estimated-pool">{token1}/{token2}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hook status:</span>
            <span className="font-medium" data-testid="text-liquidity-hook-status">
              Active Hook: {hookStatusLabel}
            </span>
          </div>
          
          {selectedHook === 'custom' && isHookValidated && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hook address:</span>
              <span className="font-mono text-xs text-green-500" data-testid="text-hook-address">
                {customHookAddress.slice(0, 6)}...{customHookAddress.slice(-4)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
