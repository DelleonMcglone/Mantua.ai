import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ArrowUpDown, Settings, ChevronUp, TrendingUp, Zap, CheckCircle, Info } from "lucide-react";
import { useActivity } from "@/contexts/ActivityContext";

// Import token logos
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
  inlineMode?: boolean;
}

export default function Swap({ 
  initialSellToken = 'ETH',
  initialBuyToken = 'USDC', 
  initialSelectedHook = 'no-hook',
  initialShowCustomHook = false,
  inlineMode = false
}: SwapProps = {}) {
  const [sellToken, setSellToken] = useState(initialSellToken || 'ETH');
  const [buyToken, setBuyToken] = useState(initialBuyToken || 'USDC');
  const [sellAmount, setSellAmount] = useState('0.5');
  const [buyAmount, setBuyAmount] = useState('$208.90');
  const [selectedHook, setSelectedHook] = useState(initialSelectedHook || 'no-hook');
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [showSwapDetails, setShowSwapDetails] = useState(false);
  const [transactionState, setTransactionState] = useState<'idle' | 'swapping' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  
  // Show custom hook section if initially requested
  const [showCustomHook, setShowCustomHook] = useState(initialShowCustomHook || initialSelectedHook === 'custom');
  
  // Activity tracking
  const { addUserActivity } = useActivity();

  // Update state when props change (for inline mode updates)
  useEffect(() => {
    if (initialSellToken) setSellToken(initialSellToken);
    if (initialBuyToken) setBuyToken(initialBuyToken);
    if (initialSelectedHook) setSelectedHook(initialSelectedHook);
    setShowCustomHook(initialShowCustomHook || initialSelectedHook === 'custom');
  }, [initialSellToken, initialBuyToken, initialSelectedHook, initialShowCustomHook]);

  const handleMaxClick = () => {
    const token = TOKENS.find(t => t.symbol === sellToken);
    if (token?.balance) {
      setSellAmount(token.balance);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = sellToken;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    
    const tempAmount = sellAmount;
    setSellAmount(buyAmount.replace('$', ''));
    setBuyAmount(`$${tempAmount}`);
  };

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

  const handleSwapSubmit = async () => {
    if (transactionState !== 'idle') return;
    
    setTransactionState('swapping');
    
    // Simulate swap initiation
    setTimeout(() => {
      setTransactionState('processing');
      setTransactionHash('0x1234567890abcdef...');
      
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
    setSellAmount('0.5');
    setBuyAmount('$208.90');
  };

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
    <div className={`${inlineMode ? 'w-full p-4 space-y-6' : 'max-w-md mx-auto p-6 space-y-6'}`}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-swap-title">
          Swap {sellToken} for {buyToken}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Sell Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Sell</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {TOKENS.find(t => t.symbol === sellToken)?.symbol} {TOKENS.find(t => t.symbol === sellToken)?.balance || '0.0'}
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
              
              <Select value={sellToken} onValueChange={setSellToken}>
                <SelectTrigger className="w-32" data-testid="select-sell-token">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={TOKENS.find(t => t.symbol === sellToken)?.logo} 
                      alt={sellToken}
                      className="w-5 h-5 rounded-full" 
                    />
                    <span>{sellToken}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={token.logo} 
                          alt={token.symbol}
                          className="w-5 h-5 rounded-full" 
                        />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxClick}
                data-testid="button-max"
              >
                Max
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              0.0567 {sellToken}
            </div>
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
                Balance: {TOKENS.find(t => t.symbol === buyToken)?.symbol} {TOKENS.find(t => t.symbol === buyToken)?.balance || '0.0'}
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
              
              <Select value={buyToken} onValueChange={setBuyToken}>
                <SelectTrigger className="w-32" data-testid="select-buy-token">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={TOKENS.find(t => t.symbol === buyToken)?.logo} 
                      alt={buyToken}
                      className="w-5 h-5 rounded-full" 
                    />
                    <span>{buyToken}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={token.logo} 
                          alt={token.symbol}
                          className="w-5 h-5 rounded-full" 
                        />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Balance: {TOKENS.find(t => t.symbol === buyToken)?.symbol} {TOKENS.find(t => t.symbol === buyToken)?.balance || '0.034'}
            </div>
          </div>

          {/* Hook Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Select a swap hook (optional)</Label>
            
            <Select value={selectedHook} onValueChange={setSelectedHook}>
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
            {selectedHook === 'custom' && (
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
                
                <div className="text-sm text-muted-foreground">
                  Enter a deployed hook contract address that implements beforeSwap, afterSwap or custom logic.
                </div>
                
                <a href="#" className="text-sm text-primary hover:underline">
                  Learn more about Uniswap v4 hooks →
                </a>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Swap Details Panel */}
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
  );
}