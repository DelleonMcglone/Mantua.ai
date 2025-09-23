import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onActionClick?: (actionId: string) => void;
}

export default function ActionButtons({ onActionClick }: ActionButtonsProps) {
  const actions = [
    { label: "What can Mantua.AI do?", id: "what-mantua-do" },
    { label: "Learn about Hooks", id: "learn-hooks" },
    { label: "Analyze Uniswap v4 contracts", id: "analyze-uniswap-v4" },
  ];

  const handleActionClick = (actionId: string) => {
    if (onActionClick) {
      onActionClick(actionId);
    } else {
      console.log('Action clicked:', actionId);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="py-3 px-4 text-sm font-medium text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          onClick={() => handleActionClick(action.id)}
          data-testid={`button-action-${action.id}`}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}