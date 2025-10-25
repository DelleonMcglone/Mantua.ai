import { Button } from "@/components/ui/button";

interface AvailablePoolsPromptProps {
  onViewPools: () => void;
}

export default function AvailablePoolsPrompt({ onViewPools }: AvailablePoolsPromptProps) {
  return (
    <div
      className="bg-background border rounded-2xl shadow-sm p-6 space-y-3"
      data-testid="component-available-pools-cta"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Add liquidity with confidence</h3>
        <p className="text-sm text-muted-foreground">
          Browse Mantua pools to compare hooks, APRs, and volume before supplying liquidity.
        </p>
      </div>
      <Button
        className="rounded-full bg-[#6E56CF] text-white hover:bg-[#5C47B2] px-6"
        onClick={onViewPools}
      >
        View available pools
      </Button>
    </div>
  );
}
