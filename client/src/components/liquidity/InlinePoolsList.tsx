import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Eye, Droplets } from "lucide-react";

interface Pool {
  id: string;
  token1: string;
  token2: string;
  fee: string;
  tvl: string;
  hook: string | null;
  hookDescription?: string;
  apr: string;
}

interface InlinePoolsListProps {
  onAddLiquidity: (pool: Pool) => void;
  onViewDetails?: (poolId: string) => void;
}

export function InlinePoolsList({ onAddLiquidity, onViewDetails }: InlinePoolsListProps) {
  // Pool data with hooks
  const POOLS: Pool[] = [
    {
      id: "eth-usdc-dynamic",
      token1: "ETH",
      token2: "USDC",
      fee: "0.3%",
      tvl: "$2.3M",
      hook: "Dynamic Fee Hook",
      hookDescription: "Adjusts fees based on volatility",
      apr: "12.7%"
    },
    {
      id: "cbeth-eth-twamm",
      token1: "cbETH",
      token2: "ETH",
      fee: "0.05%",
      tvl: "$1.1M",
      hook: "TWAMM Hook",
      hookDescription: "Time-weighted average market maker",
      apr: "8.4%"
    },
    {
      id: "wsteth-eth-intel",
      token1: "wstETH",
      token2: "ETH",
      fee: "0.05%",
      tvl: "$890K",
      hook: "Mantua Intel Hook",
      hookDescription: "AI-powered liquidity optimization",
      apr: "15.2%"
    },
    {
      id: "usdc-dai-mev",
      token1: "USDC",
      token2: "DAI",
      fee: "0.01%",
      tvl: "$420K",
      hook: "MEV Protection Hook",
      hookDescription: "Protects against MEV attacks",
      apr: "4.8%"
    },
    {
      id: "eth-usdc-no-hook",
      token1: "ETH",
      token2: "USDC",
      fee: "0.3%",
      tvl: "$1.8M",
      hook: null,
      apr: "10.1%"
    }
  ];

  return (
    <Card className="p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Available Liquidity Pools</h3>
        <Badge variant="outline" className="ml-auto">Base Sepolia</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Select a pool to add liquidity and start earning rewards.
      </p>

      {/* Pools Grid */}
      <div className="space-y-2">
        {POOLS.map((pool) => (
          <div
            key={pool.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            {/* Pool Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {pool.token1} / {pool.token2}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {pool.fee}
                </Badge>
                {pool.hook && (
                  <Badge variant="outline" className="text-xs">
                    {pool.hook}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>TVL: {pool.tvl}</span>
                <span className="text-green-600 font-medium">APR: {pool.apr}</span>
                {pool.hookDescription && (
                  <span className="italic">{pool.hookDescription}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(pool.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onAddLiquidity(pool)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Liquidity
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <strong>Tip:</strong> Pools with hooks offer enhanced functionality like dynamic fees, MEV protection, and TWAMM.
      </div>
    </Card>
  );
}
