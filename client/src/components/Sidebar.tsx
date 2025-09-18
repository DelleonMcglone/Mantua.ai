import { ChevronDown, MessageSquarePlus, Search, Settings, Package, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Sidebar() {
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 h-full">
      <div className="space-y-2">
        {/* Assets Dropdown */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              setIsAssetsOpen(!isAssetsOpen);
              console.log('Assets dropdown toggled:', !isAssetsOpen);
            }}
            data-testid="button-assets-dropdown"
          >
            <Package className="h-4 w-4" />
            Assets
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`} />
          </Button>
          {isAssetsOpen && (
            <div className="ml-6 mt-1 space-y-1" data-testid="dropdown-assets-content">
              <button className="text-sm text-muted-foreground hover:text-sidebar-foreground block py-1 hover-elevate px-2 rounded-sm">
                Tokens
              </button>
              <button className="text-sm text-muted-foreground hover:text-sidebar-foreground block py-1 hover-elevate px-2 rounded-sm">
                NFTs
              </button>
              <button className="text-sm text-muted-foreground hover:text-sidebar-foreground block py-1 hover-elevate px-2 rounded-sm">
                Pools
              </button>
            </div>
          )}
        </div>

        {/* New chats */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-primary hover:bg-sidebar-accent"
          onClick={() => console.log('New chats clicked')}
          data-testid="button-new-chats"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chats
        </Button>

        {/* Search */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => console.log('Search clicked')}
          data-testid="button-search"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>

        {/* User activity */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => console.log('User activity clicked')}
          data-testid="button-user-activity"
        >
          <User className="h-4 w-4" />
          User activity
        </Button>

        {/* Agent activity */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => console.log('Agent activity clicked')}
          data-testid="button-agent-activity"
        >
          <Bot className="h-4 w-4" />
          Agent activity
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => console.log('Settings clicked')}
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </aside>
  );
}