import { Button } from "@/components/ui/button";

interface AvailablePoolsPromptProps {
  onViewPools: () => void;
}

export default function AvailablePoolsPrompt({ onViewPools }: AvailablePoolsPromptProps) {
  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 max-w-md hover-elevate active-elevate-2" 
      data-testid="div-available-pools-prompt"
    >
      <h3 className="font-semibold text-foreground mb-2" data-testid="text-prompt-title">
        View Available Pools
      </h3>
      <p className="text-sm text-muted-foreground mb-4" data-testid="text-prompt-description">
        Explore liquidity pools to provide liquidity and earn rewards.
      </p>
      <Button
        onClick={onViewPools}
        className="w-full"
        data-testid="button-view-pools"
      >
        View Pools
      </Button>
    </div>
  );
}
