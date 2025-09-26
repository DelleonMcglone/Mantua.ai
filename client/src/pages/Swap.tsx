import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ArrowUpDown, Settings, ChevronUp, TrendingUp, Zap, CheckCircle, Info } from "lucide-react";

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

export default function Swap() {
  const [sellToken, setSellToken] = useState('ETH');
  const [buyToken, setBuyToken] = useState('USDC');
  const [sellAmount, setSellAmount] = useState('0.5');
  const [buyAmount, setBuyAmount] = useState('$208.90');
  const [selectedHook, setSelectedHook] = useState('no-hook');
  const [customHookAddress, setCustomHookAddress] = useState('');
  const [isValidatingHook, setIsValidatingHook] = useState(false);
  const [isHookValidated, setIsHookValidated] = useState(false);
  const [hookError, setHookError] = useState('');
  const [showSwapDetails, setShowSwapDetails] = useState(false);
  const [transactionState, setTransactionState] = useState<'idle' | 'swapping' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');

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
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Success Header */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
              Swap completed successfully
            </h2>
            <p className="text-lg text-green-700 dark:text-green-300">
              You received 600 USDC for 0.2 ETH
            </p>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Total value</div>
              <div className="text-lg font-semibold text-green-600">$600.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Gas saved</div>
              <div className="text-lg font-semibold text-green-600">$0.80</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Execution time</div>
              <div className="text-lg font-semibold text-green-600">15 secs</div>
            </CardContent>
          </Card>
        </div>

        {/* Updated Portfolio */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <CardTitle className="text-base">Your updated portfolio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">USDC balance</span>
              <div className="text-right">
                <div className="font-medium">600.00 USDC</div>
                <div className="text-xs text-muted-foreground">24h Change</div>
              </div>
              <div className="text-sm text-green-600 font-medium">+$45.20 (+1.5%)</div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ETH Balance</span>
              <div className="text-right">
                <div className="font-medium">0.8 ETH</div>
                <div className="text-xs text-muted-foreground">Gas Spent Today</div>
              </div>
              <div className="text-sm text-muted-foreground">$3.12</div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Value</span>
              <div className="text-right">
                <div className="font-medium">$3,000.00</div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
              <div className="text-sm text-muted-foreground">1 completed</div>
            </div>
          </CardContent>
        </Card>

        {/* Mantua Suggestion */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-primary mb-2">
                  Mantua suggests your next move:
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Since you now have 600 USDC, you could add it to a liquidity pool to start earning 
                  passive income. This would generate approximately $48/month in fees based on 
                  current pool performance.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => console.log('Navigate to liquidity pools')}
                  data-testid="button-liquidity-suggestion"
                >
                  Tell me more about liquidity pools
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={resetSwap}
            className="flex-1"
            data-testid="button-new-swap"
          >
            New Swap
          </Button>
          <Button 
            onClick={() => console.log('View transaction')}
            className="flex-1"
            data-testid="button-view-transaction"
          >
            View Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
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

            {/* No Hook Added State */}
            {selectedHook === 'no-hook' && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">No Hook Added</span>
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
              </div>
            )}
          </div>

          {/* Informational Text */}
          <div className="text-sm text-muted-foreground">
            Enter a deployed hook contract address that implements beforeSwap, afterSwap or custom logic.
          </div>
          
          <a href="#" className="text-sm text-primary hover:underline block" data-testid="link-learn-hooks">
            Learn more about Uniswap v4 hooks →
          </a>
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
              
              <div className="flex justify-between items-center" data-testid="row-order-routing">
                <span className="text-sm text-muted-foreground">Order routing</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Uniswap API</span>
                  <span className="text-xs text-muted-foreground">(0.25%)</span>
                </div>
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
          {transactionState === 'completed' && 'Swap Complete'}
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