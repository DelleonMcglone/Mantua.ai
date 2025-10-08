import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount } from 'thirdweb/react';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  isAgentMode?: boolean;
  onExitAgent?: () => void;
}

export default function ChatInput({ onSubmit, onQuickAction, isAgentMode, onExitAgent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleQuickAction = (actionId: string) => {
    if (!account) {
      // Inject system message if wallet not connected
      if (onSubmit) {
        onSubmit("Please connect your wallet to continue.");
      }
      return;
    }

    // Get the display text for the action
    const actionLabels: Record<string, string> = {
      'swap': 'Swap',
      'add-liquidity': 'Add Liquidity',
      'analyze': 'Analyze',
      'explore-agents': 'Explore Agents'
    };

    // Inject user message
    const userMessage = actionLabels[actionId] || actionId;
    if (onSubmit) {
      onSubmit(userMessage);
    }

    // Trigger the action for assistant response
    if (onQuickAction) {
      onQuickAction(actionId);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-2xl border border-border/50 shadow-sm">
        {/* Plus button dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full transition-all"
              data-testid="button-quick-actions"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-64" data-testid="dropdown-quick-actions">
            <DropdownMenuItem
              onClick={() => handleQuickAction('swap')}
              data-testid="dropdown-item-swap"
            >
              Swap
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('add-liquidity')}
              data-testid="dropdown-item-add-liquidity"
            >
              Add Liquidity
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('analyze')}
              data-testid="dropdown-item-analyze"
            >
              Analyze
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('explore-agents')}
              data-testid="dropdown-item-explore-agents"
            >
              Explore Agents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
            className="text-xs bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-3 py-1 h-6"
            onClick={onExitAgent}
            data-testid="button-agent-mode"
          >
            Agent
          </Button>
        )}

        <Button
          size="icon"
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