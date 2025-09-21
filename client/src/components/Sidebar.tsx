import { ChevronDown, MessageSquarePlus, Search, Settings, Package, User, Bot, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useActiveAccount, useWalletBalance } from 'thirdweb/react';
import { client, baseSepolia } from '../providers/ThirdwebProvider';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function TokensSection({ isExpanded }: { isExpanded: boolean }) {
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: baseSepolia,
    address: account?.address,
  });

  if (!account) {
    return (
      <div className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground" data-testid="text-tokens-connect-prompt">
        Connect your wallet to view tokens
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground" data-testid="text-tokens-loading">
        Loading balances...
      </div>
    );
  }

  return (
    <div className="ml-6 mt-1 space-y-1" data-testid="div-tokens-balances">
      {balance && (
        <div className="flex justify-between items-center px-2 py-1 text-xs" data-testid="div-eth-balance">
          <span className="text-sidebar-foreground">ETH</span>
          <span className="text-muted-foreground">
            {parseFloat(balance.displayValue).toFixed(4)}
          </span>
        </div>
      )}
      {/* Additional tokens would be displayed here */}
      {!balance && (
        <div className="px-2 py-1 text-xs text-muted-foreground" data-testid="text-no-balances">
          No tokens found
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsAssetsOpen(false); // Close assets dropdown when collapsing
    }
    console.log('Sidebar toggled:', !isExpanded);
  };

  return (
    <>      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 
          bg-sidebar border-r border-sidebar-border 
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
        data-testid="sidebar-main"
      >
        <div className="p-4 h-full">
          {/* Hamburger menu toggle at top of sidebar */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className={`w-full hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              data-testid="button-sidebar-toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {/* New chats */}
            <Button
              variant="ghost"
              className={`w-full text-primary hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => console.log('New chats clicked')}
              data-testid="button-new-chats"
              title={!isExpanded ? 'New chats' : ''}
            >
              <MessageSquarePlus className="h-4 w-4" />
              {isExpanded && 'New chats'}
            </Button>

            {/* Search */}
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => console.log('Search clicked')}
              data-testid="button-search"
              title={!isExpanded ? 'Search' : ''}
            >
              <Search className="h-4 w-4" />
              {isExpanded && 'Search'}
            </Button>

            {/* Assets Dropdown */}
            <div>
              <Button
                variant="ghost"
                className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                  isExpanded ? 'justify-start gap-2' : 'justify-center'
                }`}
                onClick={() => {
                  if (isExpanded) {
                    setIsAssetsOpen(!isAssetsOpen);
                    console.log('Assets dropdown toggled:', !isAssetsOpen);
                  }
                }}
                data-testid="button-assets-dropdown"
                title={!isExpanded ? 'Assets' : ''}
              >
                <Package className="h-4 w-4" />
                {isExpanded && (
                  <>
                    Assets
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </Button>
              {isExpanded && isAssetsOpen && (
                <div className="space-y-2" data-testid="dropdown-assets-content">
                  <div>
                    <div className="ml-6 text-sm font-medium text-sidebar-foreground mb-1">
                      Tokens
                    </div>
                    <TokensSection isExpanded={isExpanded} />
                  </div>
                  <button className="ml-6 text-sm text-muted-foreground hover:text-sidebar-foreground block py-1 hover-elevate px-2 rounded-sm">
                    Pools
                  </button>
                </div>
              )}
            </div>

            {/* User activity */}
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => console.log('User activity clicked')}
              data-testid="button-user-activity"
              title={!isExpanded ? 'User activity' : ''}
            >
              <User className="h-4 w-4" />
              {isExpanded && 'User activity'}
            </Button>

            {/* Agent activity */}
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => console.log('Agent activity clicked')}
              data-testid="button-agent-activity"
              title={!isExpanded ? 'Agent activity' : ''}
            >
              <Bot className="h-4 w-4" />
              {isExpanded && 'Agent activity'}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => console.log('Settings clicked')}
              data-testid="button-settings"
              title={!isExpanded ? 'Settings' : ''}
            >
              <Settings className="h-4 w-4" />
              {isExpanded && 'Settings'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}