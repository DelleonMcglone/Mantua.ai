import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount } from 'thirdweb/react';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  isSwapModeActive?: boolean;
  onSwapModeRequest?: () => void;
  onSwapModeExit?: () => void;
  isLiquidityModeActive?: boolean;
  onLiquidityModeRequest?: () => void;
  onLiquidityModeExit?: () => void;
  isAnalyzeModeActive?: boolean;
  onAnalyzeModeRequest?: () => void;
  onAnalyzeModeExit?: () => void;
  isRemoveLiquidityModeActive?: boolean;
  onRemoveLiquidityModeRequest?: () => void;
  onRemoveLiquidityModeExit?: () => void;
  isCollectFeesModeActive?: boolean;
  onCollectFeesModeRequest?: () => void;
  onCollectFeesModeExit?: () => void;
}

export default function ChatInput({
  onSubmit,
  onQuickAction,
  isSwapModeActive = false,
  onSwapModeRequest,
  onSwapModeExit,
  isLiquidityModeActive = false,
  onLiquidityModeRequest,
  onLiquidityModeExit,
  isAnalyzeModeActive = false,
  onAnalyzeModeRequest,
  onAnalyzeModeExit,
  isRemoveLiquidityModeActive = false,
  onRemoveLiquidityModeRequest,
  onRemoveLiquidityModeExit,
  isCollectFeesModeActive = false,
  onCollectFeesModeRequest,
  onCollectFeesModeExit,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const account = useActiveAccount();
  const menuActions = [
    { id: "analyze", label: "Analyze", disabled: false },
    { id: "swap", label: "Swap", disabled: false },
    { id: "add-liquidity", label: "Add Liquidity", disabled: false },
    { id: "remove-liquidity", label: "Remove Liquidity", disabled: false },
    { id: "collect-fees", label: "Collect Fees", disabled: false },
  ] as const;

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

    const requiresWallet = actionId !== "analyze";
    if (!account && requiresWallet) {
      if (onSubmit) {
        onSubmit("Please connect your wallet to continue.");
      }
      return;
    }

    const actionLabels: Record<string, string> = {
      analyze: "Analyze",
      swap: "Swap",
      "add-liquidity": "Add Liquidity",
      "remove-liquidity": "Remove Liquidity",
      "collect-fees": "Collect Fees",
    };

    const userMessage = actionLabels[actionId] || actionId;
    if (actionLabels[actionId] && onSubmit) {
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
    if (!isSwapModeActive && !isLiquidityModeActive && !isAnalyzeModeActive && !isRemoveLiquidityModeActive && !isCollectFeesModeActive) {
      setMenuVisible(false);
    }
  }, [isSwapModeActive, isLiquidityModeActive, isAnalyzeModeActive, isRemoveLiquidityModeActive, isCollectFeesModeActive]); // Collapse quick actions when exiting structured flows

  const handleSwapModeExit = () => {
    onSwapModeExit?.();
    setMenuVisible(false);
  };

  const handleLiquidityModeExit = () => {
    onLiquidityModeExit?.();
    setMenuVisible(false);
  }; // LIQUIDITY FIX: exit add-liquidity mode from badge

  const handleAnalyzeModeExit = () => {
    onAnalyzeModeExit?.();
    setMenuVisible(false);
  };

  const handleRemoveLiquidityModeExit = () => {
    onRemoveLiquidityModeExit?.();
    setMenuVisible(false);
  };

  const handleCollectFeesModeExit = () => {
    onCollectFeesModeExit?.();
    setMenuVisible(false);
  };

  const handleQuickActionSelect = (actionId: string, disabled?: boolean) => {
    if (disabled) {
      return;
    }
    if (actionId === "swap") {
      onSwapModeRequest?.();
    }
    if (actionId === "add-liquidity") {
      onLiquidityModeRequest?.();
    }
    if (actionId === "analyze") {
      onAnalyzeModeRequest?.();
    }
    if (actionId === "remove-liquidity") {
      onRemoveLiquidityModeRequest?.();
    }
    if (actionId === "collect-fees") {
      onCollectFeesModeRequest?.();
    }
    triggerQuickAction(actionId);
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm ${
          isAnalyzeModeActive
            ? "bg-primary/5 border-primary/60 ring-1 ring-primary/40"
            : "bg-muted/30 border-border/50"
        }`}
      >
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

        {isAnalyzeModeActive && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="group h-8 rounded-full px-4 text-sm font-medium"
            onClick={handleAnalyzeModeExit}
            aria-pressed={isAnalyzeModeActive}
            data-testid="button-analyze-mode-active"
          >
            <span className="group-hover:hidden">Analyze</span>
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

        {isRemoveLiquidityModeActive && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="group h-8 rounded-full px-4 text-sm font-medium"
            onClick={handleRemoveLiquidityModeExit}
            aria-pressed={isRemoveLiquidityModeActive}
            data-testid="button-remove-liquidity-mode-active"
          >
            <span className="group-hover:hidden">Remove Liquidity</span>
            <X className="hidden h-4 w-4 group-hover:block" aria-hidden="true" />
          </Button>
        )}

        {isCollectFeesModeActive && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="group h-8 rounded-full px-4 text-sm font-medium"
            onClick={handleCollectFeesModeExit}
            aria-pressed={isCollectFeesModeActive}
            data-testid="button-collect-fees-mode-active"
          >
            <span className="group-hover:hidden">Collect Fees</span>
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
            {menuActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickActionSelect(action.id, action.disabled)}
                type="button"
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors ${
                  action.disabled
                    ? "text-muted-foreground cursor-not-allowed opacity-70"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`dropdown-item-${action.id}`}
                role="menuitem"
                tabIndex={isMenuVisible && !action.disabled ? 0 : -1}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isAnalyzeModeActive
              ? "Ask me to analyze pools, tokens, or networks in real time..."
              : "Ask Mantua"
          }
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70 resize-none transition-all duration-200 min-h-[40px]"
          data-testid="textarea-chat-message"
          rows={1}
        />

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
