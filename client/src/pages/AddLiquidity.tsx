import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, CheckCircle, X, AlertCircle } from "lucide-react";
import { useActivity } from "@/contexts/ActivityContext";

import ethereumLogo from '@assets/Frame 352 (1)_1758910668532.png';
import usdcLogo from '@assets/Frame 352_1758910679715.png';
import cbbtcLogo from '@assets/Frame 352 (2)_1758910679714.png';
import eurcLogo from '@assets/Frame 352 (3)_1758910679715.png';

interface Token {
  symbol: string;
  name: string;
  balance?: string;
  logo: string;
}

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '0.034', logo: ethereumLogo },
  { symbol: 'USDC', name: 'USD Coin', balance: '0.034', logo: usdcLogo },
  { symbol: 'cbBTC', name: 'Coinbase Bitcoin', balance: '0.0', logo: cbbtcLogo },
  { symbol: 'EURC', name: 'Euro Coin', balance: '0.0', logo: eurcLogo }
];

const FEE_TIERS = [
  { value: '0.01', label: '0.01% - best for very stable pairs' },
  { value: '0.05', label: '0.05% - best for stable pairs' },
  { value: '0.30', label: '0.30% - most common' },
  { value: '1.00', label: '1.00% - best for exotic pairs' }
];

const HOOK_OPTIONS = [
  { value: 'no-hook', label: 'No Hook' },
  { value: 'dynamic-fee', label: 'Dynamic fee hook' },
  { value: 'twamm', label: 'TWAMM hook' },
  { value: 'mev-protection', label: 'MEV protection hook' },
  { value: 'custom', label: 'Custom hook' }
];

interface AddLiquidityProps {
  initialToken1?: string;
  initialToken2?: string;
  initialSelectedHook?: string;
  initialShowCustomHook?: boolean;
  poolName?: string;
  inlineMode?: boolean;
}

export default function AddLiquidity({ 
  initialToken1 = 'ETH',
  initialToken2 = 'USDC',
  initialSelectedHook = 'no-hook',
  initialShowCustomHook = false,
  poolName,
  inlineMode = false
}: AddLiquidityProps = {}) {
  const [token1, setToken1] = useState(initialToken1 || 'ETH');
  const [token2, setToken2] = useState(initialToken2 || 'USDC');
  const [amount1, setAmount1] = useState('0.5');
  const [amount2, setAmount2] = useState('$208.90');
  const [feeTier, setFeeTier] = useState('0.30');
  const [selectedHook, setSelectedHook] = useState(initialSelectedHook || 'no-hook');
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [transactionState, setTransactionState] = useState<'idle' | 'adding' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  
  const [showCustomHook, setShowCustomHook] = useState(initialShowCustomHook || initialSelectedHook === 'custom');
  
  const { addUserActivity } = useActivity();

  useEffect(() => {
    if (initialToken1) setToken1(initialToken1);
    if (initialToken2) setToken2(initialToken2);
    if (initialSelectedHook) setSelectedHook(initialSelectedHook);
    setShowCustomHook(initialShowCustomHook || initialSelectedHook === 'custom');
  }, [initialToken1, initialToken2, initialSelectedHook, initialShowCustomHook]);

  const handleMaxClick = (tokenNumber: 1 | 2) => {
    const tokenSymbol = tokenNumber === 1 ? token1 : token2;
    const token = TOKENS.find(t => t.symbol === tokenSymbol);
    if (token?.balance) {
      if (tokenNumber === 1) {
        setAmount1(token.balance);
      } else {
        setAmount2(token.balance);
      }
    }
  };

  const validateHookAddress = async () => {
    if (!customHookAddress.trim()) return;
    
    setIsValidatingHook(true);
    setHookError('');
    
    setTimeout(() => {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(customHookAddress);
      
      if (isValid) {
        setIsHookValidated(true);
        setHookError('');
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
  };

  const handleAddLiquidity = async () => {
    if (selectedHook === 'custom' && !isHookValidated) {
      setHookError('Please validate your custom hook address first.');
      return;
    }

    setTransactionState('adding');
    
    setTimeout(() => {
      setTransactionState('processing');
      setTransactionHash('0x' + Math.random().toString(16).substring(2, 42));
      
      setTimeout(() => {
        setTransactionState('completed');
        
        const token1Data = TOKENS.find(t => t.symbol === token1);
        const token2Data = TOKENS.find(t => t.symbol === token2);
        const totalValueUSD = '$1,890.00';
        
        addUserActivity({
          type: 'Liquidity',
          assets: `${token1Data?.symbol} / ${token2Data?.symbol}`,
          amounts: `${amount1} ${token1Data?.symbol} + ${amount2.replace('$', '')} ${token2Data?.symbol}`,
          value: totalValueUSD,
          date: new Date().toLocaleDateString(),
          status: 'Completed'
        });
      }, 3000);
    }, 2000);
  };

  const handleAddMore = () => {
    setTransactionState('idle');
    setAmount1('0.5');
    setAmount2('$208.90');
    setCustomHookAddress('');
    setIsHookValidated(false);
  };

  if (transactionState === 'completed') {
    const token1Data = TOKENS.find(t => t.symbol === token1);
    const token2Data = TOKENS.find(t => t.symbol === token2);
    
    return (
      <div className={`${inlineMode ? 'w-full p-4 space-y-4' : 'max-w-md mx-auto p-6 space-y-4'}`} data-testid="liquidity-success-screen">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" data-testid="icon-success" />
            <h2 className="text-lg font-semibold text-foreground mb-2" data-testid="text-success-title">
              Added {amount1} {token1Data?.symbol} and {amount2.replace('$', '')} {token2Data?.symbol} to pool
            </h2>
            <p className="text-foreground mb-2">Liquidity added successfully!</p>
            <p className="text-sm text-muted-foreground">
              <a 
                href={`https://sepolia-explorer.base.org/tx/${transactionHash}`}
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
          className="w-full"
          onClick={handleAddMore}
          data-testid="button-add-more-liquidity"
        >
          Add more liquidity
        </Button>
      </div>
    );
  }

  const token1Data = TOKENS.find(t => t.symbol === token1);
  const token2Data = TOKENS.find(t => t.symbol === token2);

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" data-testid="text-add-liquidity-title">
          {poolName || `Add liquidity to ${token1}/${token2} pool`}
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="text-add-liquidity-subtitle">
          Choose tokens you want to provide liquidity for. You can select tokens on all supported networks.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Token 1</Label>
            <span className="text-sm text-muted-foreground">
              Balance: {token1Data?.symbol} {token1Data?.balance}
            </span>
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
            
            <Select value={token1} onValueChange={setToken1}>
              <SelectTrigger className="w-32" data-testid="select-token1">
                <SelectValue />
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
              data-testid="button-max-token1"
            >
              Max
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Token 2</Label>
            <span className="text-sm text-muted-foreground">
              Balance: {token2Data?.symbol} {token2Data?.balance}
            </span>
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
            
            <Select value={token2} onValueChange={setToken2}>
              <SelectTrigger className="w-32" data-testid="select-token2">
                <SelectValue />
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
            <Label>Select a swap hook (optional)</Label>
            <Select 
              value={selectedHook} 
              onValueChange={(value) => {
                setSelectedHook(value);
                setShowCustomHook(value === 'custom');
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
                
                <p className="text-xs text-muted-foreground">
                  Enter a deployed hook contact address that implements beforeSwap, afterSwap or custom logic.
                </p>
                
                <a 
                  href="https://docs.uniswap.org/contracts/v4/hooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  data-testid="link-learn-hooks"
                >
                  Learn more about Uniswap v4 hooks →
                </a>
              </div>
            </div>
          )}
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
            <Badge 
              variant={selectedHook === 'custom' ? 'default' : 'secondary'}
              className="text-xs"
              data-testid="badge-hook-status"
            >
              {selectedHook === 'custom' ? 'Custom hook swap' : 'No hook'}
            </Badge>
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
