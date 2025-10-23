import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount } from 'thirdweb/react';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  isAgentMode?: boolean;
  onExitAgent?: () => void;
  isSwapModeActive?: boolean;
  onSwapModeRequest?: () => void;
  onSwapModeExit?: () => void;
  isLiquidityModeActive?: boolean;
  onLiquidityModeRequest?: () => void;
  onLiquidityModeExit?: () => void;
}

export default function ChatInput({
  onSubmit,
  onQuickAction,
  isAgentMode,
  onExitAgent,
  isSwapModeActive = false,
  onSwapModeRequest,
  onSwapModeExit,
  isLiquidityModeActive = false,
  onLiquidityModeRequest,
  onLiquidityModeExit,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const account = useActiveAccount();

  const handleSend = () => {
    if (message.trim()) {
      if (onSubmit) {
        onSubmit(message);
      } else {
        console.log('Message sent:', message);
      }
      setMessage("");
      // Reset textarea to single line
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      // Calculate line height and max height (5-6 lines)
      const lineHeight = 24; // approximate line height in px
      const maxLines = 5;
      const maxHeight = lineHeight * maxLines;
      
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      
      // Enable scroll when content exceeds max height
      textarea.style.overflowY = scrollHeight > maxHeight ? 'scroll' : 'hidden';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuVisible((prev) => !prev);
  }; // SWAP FIX: Button trigger condition

  const triggerQuickAction = (actionId: string) => {
    setMenuVisible(false);

    if (!account) {
      if (onSubmit) {
        onSubmit("Please connect your wallet to continue.");
      }
      return;
    }

    const actionLabels: Record<string, string> = {
      swap: "Swap",
      "add-liquidity": "Add Liquidity",
      analyze: "Analyze",
      "explore-agents": "Explore Agents",
    };

    const userMessage = actionLabels[actionId] || actionId;
    if (onSubmit) {
      onSubmit(userMessage);
    }

    onQuickAction?.(actionId);
    textareaRef.current?.focus();
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setMenuVisible(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuVisible]);

  useEffect(() => {
    if (!isSwapModeActive && !isLiquidityModeActive) {
      setMenuVisible(false);
    }
  }, [isSwapModeActive, isLiquidityModeActive]); // SWAP FIX: collapse quick actions when exiting structured flows

  const handleSwapModeExit = () => {
    onSwapModeExit?.();
    setMenuVisible(false);
  };

  const handleLiquidityModeExit = () => {
    onLiquidityModeExit?.();
    setMenuVisible(false);
  }; // LIQUIDITY FIX: exit add-liquidity mode from badge

  const handleQuickActionSelect = (actionId: string) => {
    if (actionId === "swap") {
      onSwapModeRequest?.(); // SWAP FIX: Button trigger condition
    }
    if (actionId === "add-liquidity") {
      onLiquidityModeRequest?.(); // LIQUIDITY FIX: Button trigger condition
    }
    triggerQuickAction(actionId);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-2xl border border-border/50 shadow-sm">
        {/* Plus button */}
        <Button
          ref={buttonRef}
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full transition-all"
          onClick={toggleMenu}
          data-testid="button-quick-actions"
          aria-label="Open quick actions menu"
          aria-expanded={isMenuVisible}
          aria-haspopup="menu"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {isSwapModeActive && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="group h-8 rounded-full px-4 text-sm font-medium"
            onClick={handleSwapModeExit}
            aria-pressed={isSwapModeActive}
            data-testid="button-swap-mode-active"
          >
            <span className="group-hover:hidden">Swap</span>
            <X className="hidden h-4 w-4 group-hover:block" aria-hidden="true" />
          </Button>
        )}

        {isLiquidityModeActive && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="group h-8 rounded-full px-4 text-sm font-medium"
            onClick={handleLiquidityModeExit}
            aria-pressed={isLiquidityModeActive}
            data-testid="button-liquidity-mode-active"
          >
            <span className="group-hover:hidden">Add Liquidity</span>
            <X className="hidden h-4 w-4 group-hover:block" aria-hidden="true" />
          </Button>
        )}

        {/* Dropdown Menu - absolutely positioned & layout-locked */}
        <div
          ref={menuRef}
          className={`absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 transition-all duration-150 ease-out transform origin-bottom-left ${
            isMenuVisible
              ? "opacity-100 pointer-events-auto scale-100"
              : "opacity-0 pointer-events-none scale-95"
          }`}
          data-testid="dropdown-quick-actions"
          role="menu"
          aria-label="Quick actions menu"
          aria-hidden={!isMenuVisible}
        >
          <div className="p-1">
            <button
              onClick={() => handleQuickActionSelect('swap')}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="dropdown-item-swap"
              role="menuitem"
              tabIndex={isMenuVisible ? 0 : -1}
            >
              Swap
            </button>
            <button
              onClick={() => handleQuickActionSelect('add-liquidity')}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="dropdown-item-add-liquidity"
              role="menuitem"
              tabIndex={isMenuVisible ? 0 : -1}
            >
              Add Liquidity
            </button>
            <button
              onClick={() => handleQuickActionSelect('analyze')}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="dropdown-item-analyze"
              role="menuitem"
              tabIndex={isMenuVisible ? 0 : -1}
            >
              Analyze
            </button>
            <button
              onClick={() => handleQuickActionSelect('explore-agents')}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="dropdown-item-explore-agents"
              role="menuitem"
              tabIndex={isMenuVisible ? 0 : -1}
            >
              Explore Agents
            </button>
          </div>
        </div>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mantua"
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70 resize-none transition-all duration-200 min-h-[40px]"
          data-testid="textarea-chat-message"
          rows={1}
        />

        {/* Agent mode indicator button inside input */}
        {isAgentMode && (
          <Button
            size="sm"
            type="button"
            className="text-xs bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-3 py-1 h-6"
            onClick={onExitAgent}
            data-testid="button-agent-mode"
          >
            Agent
          </Button>
        )}

        <Button
          size="icon"
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-8 w-8 rounded-full bg-primary disabled:bg-muted disabled:text-muted-foreground/50 transition-all"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
