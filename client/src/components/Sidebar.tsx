import { ChevronDown, MessageSquarePlus, Package, User, Bot, Menu, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";
import { TOKENS as TOKEN_CONFIGS } from "@/constants/tokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useUserPools } from "@/hooks/useUserPools";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SidebarToken = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
};

const TOKENS: SidebarToken[] = TOKEN_CONFIGS.map((token) => ({
  id: token.symbol.toLowerCase(),
  name: token.name,
  symbol: token.symbol,
  icon: token.logo,
}));

interface TokenSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

function TokenSearchDropdown({ isOpen, onClose, searchQuery, onSearchQueryChange }: TokenSearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter tokens based on search query
  const filteredTokens = TOKENS.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle token selection
  const handleTokenSelect = (token: SidebarToken) => {
    console.log('Token selected:', token);
    onClose();
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-1 duration-200"
      data-testid="dropdown-token-search"
    >
      {/* Search Input */}
      <div className="p-3 border-b border-sidebar-border">
        <Input
          placeholder="Search token"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full text-sm bg-background border-border"
          data-testid="input-token-search"
          autoFocus
        />
      </div>

      {/* Token List */}
      <div className="max-h-64 overflow-y-auto">
        {filteredTokens.length > 0 ? (
          <div className="py-2">
            {filteredTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleTokenSelect(token)}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-sidebar-accent text-left transition-colors"
                data-testid={`button-token-${token.id}`}
              >
                <img src={token.icon} alt={token.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sidebar-foreground text-sm">{token.name}</div>
                  <div className="text-xs text-muted-foreground">{token.symbol}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tokens found
          </div>
        )}
      </div>
    </div>
  );
}

function TokensSection({ isExpanded }: { isExpanded: boolean }) {
  const account = useActiveAccount();
  const { tokens, isFetching, error } = useTokenBalances();

  const formatBalance = (value: string) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "0";
    if (numeric >= 1) {
      return numeric.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    return numeric.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  if (!account) {
    return (
      <div
        className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground"
        data-testid="text-tokens-connect-prompt"
      >
        Connect your wallet to view tokens
      </div>
    );
  }

  if (isFetching && tokens.length === 0) {
    return (
      <div
        className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground"
        data-testid="text-tokens-loading"
      >
        Loading balances...
      </div>
    );
  }

  return (
    <div className="ml-6 mt-1 space-y-1" data-testid="div-tokens-balances">
      {tokens.length > 0 ? (
        tokens.map((token) => (
          <div
            key={token.address ?? token.symbol}
            className="flex justify-between items-center px-2 py-1 text-xs"
            data-testid={`div-token-${token.symbol.toLowerCase()}`}
          >
            <span className="text-sidebar-foreground">
              {token.symbol}
            </span>
            <span className="text-muted-foreground">
              {formatBalance(token.balance)}
            </span>
          </div>
        ))
      ) : (
        <div
          className="px-2 py-1 text-xs text-muted-foreground"
          data-testid="text-no-balances"
        >
          No tokens found
        </div>
      )}
      {error && (
        <div className="px-2 py-1 text-[10px] text-destructive" data-testid="text-token-error">
          {error}
        </div>
      )}
    </div>
  );
}

function PoolsSection({ isExpanded }: { isExpanded: boolean }) {
  const account = useActiveAccount();
  const { pools, isFetching, error } = useUserPools();
  if (!isExpanded) return null;

  if (!account) {
    return (
      <div className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground" data-testid="text-pools-connect-prompt">
        Connect your wallet to track pools
      </div>
    );
  }

  if (isFetching && pools.length === 0) {
    return (
      <div className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground" data-testid="text-pools-loading">
        Loading pools...
      </div>
    );
  }

  return (
    <div className="ml-6 mt-1 space-y-1" data-testid="div-pools-info">
      {pools.length > 0 ? (
        pools.map((pool) => (
          <div
            key={pool.id}
            className="px-2 py-1 text-xs rounded-sm border border-sidebar-border/50 bg-sidebar/30"
            data-testid={`div-pool-${pool.id}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground font-medium">
                Pool {pool.tokenA}/{pool.tokenB}
              </span>
              {pool.lpTokenBalance && (
                <span className="text-muted-foreground">
                  LP {Number(pool.lpTokenBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {(pool.amountTokenA || pool.amountTokenB) && (
              <div className="text-muted-foreground mt-1">
                {(pool.amountTokenA && Number(pool.amountTokenA) > 0) && (
                  <span className="mr-2">
                    {Number(pool.amountTokenA).toLocaleString(undefined, { maximumFractionDigits: 2 })} {pool.tokenA}
                  </span>
                )}
                {(pool.amountTokenB && Number(pool.amountTokenB) > 0) && (
                  <span>
                    {Number(pool.amountTokenB).toLocaleString(undefined, { maximumFractionDigits: 2 })} {pool.tokenB}
                  </span>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="px-2 py-1 text-xs text-muted-foreground" data-testid="text-no-pools">
          No pools tracked yet
        </div>
      )}
      {error && (
        <div className="px-2 py-1 text-[10px] text-destructive" data-testid="text-pools-error">
          {error}
        </div>
      )}
    </div>
  );
}

function ChatListSection({ isExpanded }: { isExpanded: boolean }) {
  const { allChats, currentChat, switchToChat, deleteChat } = useChatContext();
  const [location] = useLocation();
  const account = useActiveAccount();

  // Only show chat list in expanded mode and limit to recent chats
  if (!isExpanded || !account) return null;

  const recentChats = allChats.slice(0, 8); // Show up to 8 recent chats

  const handleDeleteChat = (chatId: string, chatTitle: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the chat switch
    
    const confirmed = window.confirm(`Are you sure you want to delete "${chatTitle}"?`);
    if (confirmed) {
      deleteChat(chatId);
    }
  };

  if (recentChats.length === 0) {
    return (
      <div className="ml-6 mt-1 px-2 py-1 text-xs text-muted-foreground" data-testid="text-no-chats">
        No recent chats
      </div>
    );
  }

  return (
    <div className="ml-6 mt-1 space-y-1" data-testid="div-chat-list">
      {recentChats.map((chat) => {
        const isActive = currentChat?.id === chat.id || location === `/chat/${chat.id}`;
        
        return (
          <div
            key={chat.id}
            className={`
              w-full px-2 py-1 text-xs rounded-sm hover-elevate 
              flex items-center gap-2 group
              ${isActive 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
              }
            `}
            data-testid={`div-chat-${chat.id}`}
          >
            <button
              onClick={() => switchToChat(chat.id)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
              data-testid={`button-chat-${chat.id}`}
              title={chat.title}
            >
              <MessageSquare className="h-3 w-3 flex-shrink-0" />
              <span className="truncate flex-1 min-w-0">{chat.title}</span>
              {chat.isAgentMode && (
                <Bot className="h-3 w-3 flex-shrink-0 text-primary" />
              )}
            </button>
            <button
              onClick={(e) => handleDeleteChat(chat.id, chat.title, e)}
              className="opacity-0 group-hover:opacity-100 h-3 w-3 flex-shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
              data-testid={`button-delete-chat-${chat.id}`}
              title={`Delete "${chat.title}"`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(true); // Start with chats open
  const { createNewChat } = useChatContext();
  const [, setLocation] = useLocation();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsAssetsOpen(false); // Close assets dropdown when collapsing
      setIsChatsOpen(true); // Show chats when expanding
    }
    console.log('Sidebar toggled:', !isExpanded);
  };

  const handleNewChat = () => {
    createNewChat();
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
              onClick={handleNewChat}
              data-testid="button-new-chats"
              title={!isExpanded ? 'New chats' : ''}
            >
              <MessageSquarePlus className="h-4 w-4" />
              {isExpanded && 'New chats'}
            </Button>

            {/* Chat History Dropdown */}
            {isExpanded && (
              <div>
                <Button
                  variant="ghost"
                  className={`w-full text-sidebar-foreground hover:bg-sidebar-accent justify-start gap-2`}
                  onClick={() => {
                    setIsChatsOpen(!isChatsOpen);
                  }}
                  data-testid="button-chats-dropdown"
                >
                  <MessageSquare className="h-4 w-4" />
                  Recent Chats
                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isChatsOpen ? 'rotate-180' : ''}`} />
                </Button>
                {isChatsOpen && (
                  <div className="space-y-1" data-testid="dropdown-chats-content">
                    <ChatListSection isExpanded={isExpanded} />
                  </div>
                )}
              </div>
            )}

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
                  <div>
                    <div className="ml-6 text-sm font-medium text-sidebar-foreground mb-1">
                      Pools
                    </div>
                    <PoolsSection isExpanded={isExpanded} />
                  </div>
                </div>
              )}
            </div>

            {/* User activity */}
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
                isExpanded ? 'justify-start gap-2' : 'justify-center'
              }`}
              onClick={() => setLocation('/user-activity')}
              data-testid="button-user-activity"
              title={!isExpanded ? 'User activity' : ''}
            >
              <User className="h-4 w-4" />
              {isExpanded && 'User activity'}
            </Button>

          </div>
        </div>
      </aside>
    </>
  );
}
