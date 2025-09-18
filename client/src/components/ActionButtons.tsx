import { Button } from "@/components/ui/button";

export default function ActionButtons() {
  const actions = [
    { label: "What can Mantua do?", id: "what-mantua-do" },
    { label: "Learn about Hooks", id: "learn-hooks" },
    { label: "DeFi Research", id: "defi-research" },
    { label: "Swap", id: "swap" },
    { label: "Add Liquidity", id: "add-liquidity" },
    { label: "Explore Agents", id: "explore-agents" },
  ];

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="py-3 px-4 text-sm font-medium text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          onClick={() => handleActionClick(action.label)}
          data-testid={`button-action-${action.id}`}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}