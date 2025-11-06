import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RemoveLiquidityPageProps {
  onSuccess?: (txHash: string) => void;
}

export default function RemoveLiquidityPage({ onSuccess }: RemoveLiquidityPageProps) {
  const [withdrawal, setWithdrawal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async () => {
    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);
      setIsProcessing(false);
      onSuccess?.(mockTxHash);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <div className="bg-card p-6 rounded-xl w-full max-w-md shadow-xl border">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold" data-testid="text-remove-liquidity-title">Remove liquidity</h2>
        </div>

        {/* Pool Info */}
        <div className="bg-muted p-3 rounded-lg flex justify-between gap-2 items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full" />
            <p className="font-medium" data-testid="text-pool-pair">ETH / cbBTC</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs" data-testid="badge-version">v4</Badge>
            <Badge variant="outline" className="text-xs" data-testid="badge-fee">0.3%</Badge>
            <span className="text-green-400" data-testid="text-range-status">• In range</span>
          </div>
        </div>

        {/* Withdrawal */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-2" data-testid="text-withdrawal-label">Withdrawal amount</p>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-withdrawal-percentage">{withdrawal}%</h1>

          {/* Percentage Buttons */}
          <div className="flex justify-center gap-2 mb-6">
            {[25, 50, 75, 100].map((val) => (
              <Button
                key={val}
                onClick={() => setWithdrawal(val)}
                variant={withdrawal === val ? "default" : "outline"}
                className={withdrawal === val ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                data-testid={`button-withdrawal-${val}`}
              >
                {val === 100 ? "Max" : `${val}%`}
              </Button>
            ))}
          </div>

          {/* Position Info */}
          <div className="text-left space-y-1 text-sm text-muted-foreground mb-6">
            <p data-testid="text-eth-position">ETH position: &lt;0.001 ETH</p>
            <p data-testid="text-cbbtc-position">cbBTC position: &lt;0.001 cbBTC</p>
          </div>

          {/* Review Button */}
          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
            size="lg"
            onClick={handleReview}
            disabled={isProcessing || withdrawal === 0}
            data-testid="button-review"
          >
            {isProcessing ? "Processing..." : "Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
