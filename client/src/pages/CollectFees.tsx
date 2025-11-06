import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CollectFeesPageProps {
  onSuccess?: (txHash: string) => void;
}

export default function CollectFeesPage({ onSuccess }: CollectFeesPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCollect = async () => {
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
      <div className="bg-card p-6 rounded-xl w-full max-w-sm shadow-xl border">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold" data-testid="text-collect-fees-title">Collect fees</h2>
        </div>

        {/* Token Fees (Empty by Default) */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full" />
              <p className="font-medium" data-testid="text-token-eth">ETH</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium" data-testid="text-eth-amount">0</p>
              <p className="text-muted-foreground" data-testid="text-eth-usd">(&lt;$0.00)</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full" />
              <p className="font-medium" data-testid="text-token-cbbtc">cbBTC</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium" data-testid="text-cbbtc-amount">0</p>
              <p className="text-muted-foreground" data-testid="text-cbbtc-usd">(&lt;$0.00)</p>
            </div>
          </div>
        </div>

        {/* Collect Button */}
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
          size="lg"
          onClick={handleCollect}
          disabled={isProcessing}
          data-testid="button-collect"
        >
          {isProcessing ? "Processing..." : "Collect"}
        </Button>
      </div>
    </div>
  );
}
