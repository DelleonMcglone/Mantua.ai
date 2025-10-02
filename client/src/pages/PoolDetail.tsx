import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertCircle } from "lucide-react";

import ethereumLogo from '@assets/Frame 352 (1)_1758910668532.png';
import usdcLogo from '@assets/Frame 352_1758910679715.png';

interface PoolDetailProps {
  poolId?: string;
  onBack?: () => void;
  onAddLiquidity?: () => void;
  inlineMode?: boolean;
}

export default function PoolDetail({ poolId, onBack, onAddLiquidity, inlineMode = false }: PoolDetailProps) {
  return (
    <div className="w-full space-y-6 p-6">
      {onBack && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="rounded-full"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <img src={ethereumLogo} alt="ETH" className="w-10 h-10 rounded-full border-2 border-background" />
            <img src={usdcLogo} alt="USDC" className="w-10 h-10 rounded-full border-2 border-background" />
          </div>
          <h2 className="text-2xl font-semibold" data-testid="text-pool-title">ETH/USDC pool</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1" data-testid="badge-status">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Active
          </Badge>
          <span className="text-sm text-muted-foreground" data-testid="text-fee">Fee: 0.3%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Total value locked</p>
            <p className="text-2xl font-semibold" data-testid="text-tvl">$2,400,000</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">24h volume</p>
            <p className="text-2xl font-semibold" data-testid="text-volume">$150,000</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">7d volume</p>
            <p className="text-2xl font-semibold" data-testid="text-volume-7d">$980,000</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Active users</p>
            <p className="text-2xl font-semibold" data-testid="text-users">245</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold" data-testid="text-position-title">Your Position</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pool Share</span>
                <span className="font-medium" data-testid="text-pool-share">0.024%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Position Value</span>
                <span className="font-medium" data-testid="text-position-value">0.024%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fees Earned</span>
                <span className="font-medium text-green-500" data-testid="text-fees-earned">$15.24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold" data-testid="text-pool-info-title">Pool information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fee Tier</span>
                <span className="font-medium" data-testid="text-fee-tier">Medium (0.30%)</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Ratio</span>
                <span className="font-medium" data-testid="text-ratio">1 ETH = 3,000 USDC</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pool Created</span>
                <span className="font-medium" data-testid="text-created">2025-01-15</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">APR</span>
                <span className="font-medium text-green-500" data-testid="text-apr">12.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        className="w-full"
        size="lg"
        onClick={onAddLiquidity}
        data-testid="button-add-liquidity"
      >
        + Add liquidity
      </Button>

      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-orange-500" data-testid="text-risk-title">Risk Considerations</h4>
              <ul className="text-sm text-orange-500/80 space-y-1 list-disc list-inside">
                <li data-testid="text-risk-1">Price volatility exposure</li>
                <li data-testid="text-risk-2">Impermanent loss risk</li>
                <li data-testid="text-risk-3">Smart contract risk</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold" data-testid="text-stats-title">Pool Statistics</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Trades</span>
              <span className="font-medium" data-testid="text-trades">156</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Trade Size</span>
              <span className="font-medium" data-testid="text-avg-trade">$962</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pool Age</span>
              <span className="font-medium" data-testid="text-age">23 days</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <span className="font-medium" data-testid="text-utilization">67%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
