import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollectFeesModalProps {
  onClose: () => void;
}

export default function CollectFeesModal({ onClose }: CollectFeesModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50" data-testid="modal-collect-fees">
      <div className="bg-card p-6 rounded-xl w-full max-w-sm shadow-xl relative border">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" data-testid="text-collect-fees-title">Collect fees</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            data-testid="button-close-collect-fees"
          >
            <X className="h-4 w-4" />
          </Button>
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
          data-testid="button-collect"
        >
          Collect
        </Button>
      </div>
    </div>
  );
}
