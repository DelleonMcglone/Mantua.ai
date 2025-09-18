import { ChevronDown, MessageSquarePlus, Search, Settings, Package, User, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 bg-sidebar border-r border-sidebar-border 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 h-full">
          {/* Close button for mobile */}
          <div className="flex justify-end mb-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-sidebar-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
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
        </div>
      </aside>
    </>
  );
}