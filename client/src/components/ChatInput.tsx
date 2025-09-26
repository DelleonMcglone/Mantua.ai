import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  onChainSelect?: (chain: string) => void;
  isAgentMode?: boolean;
  onExitAgent?: () => void;
}

export default function ChatInput({ onSubmit, onQuickAction, onChainSelect, isAgentMode, onExitAgent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedChain, setSelectedChain] = useState("Base Sepolia");

  const handleSend = () => {
    if (message.trim()) {
      if (onSubmit) {
        onSubmit(message);
      } else {
        console.log('Message sent:', message);
      }
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleQuickAction = (actionId: string) => {
    if (onQuickAction) {
      onQuickAction(actionId);
    }
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    console.log('Chain selected:', chain);
    if (onChainSelect) {
      onChainSelect(chain);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-2xl border border-border/50 shadow-sm">
        {/* Plus button dropdown */}
        <DropdownMenu>
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
          <DropdownMenuContent align="start" side="top" className="w-64" data-testid="dropdown-quick-actions">
            <DropdownMenuItem
              onClick={() => handleQuickAction('what-can-mantua-do')}
              data-testid="dropdown-item-what-can-mantua-do"
            >
              What can Mantua do
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('learn-about-hooks')}
              data-testid="dropdown-item-learn-about-hooks"
            >
              Learn about Hooks
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('analyze-uniswap-v4')}
              data-testid="dropdown-item-analyze-uniswap-v4"
            >
              Analyze Uniswap v4 contracts
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleQuickAction('explore-agent')}
              data-testid="dropdown-item-explore-agent"
            >
              Explore Agents
            </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Chain Selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-3 rounded-full bg-background/50 border-border/50 transition-all text-sm"
              data-testid="button-chain-selector"
            >
              {selectedChain}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48" data-testid="dropdown-chain-selector">
            <DropdownMenuItem
              onClick={() => handleChainSelect('Base Sepolia')}
              data-testid="dropdown-item-base-sepolia"
            >
              Base Sepolia
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleChainSelect('Unichain Sepolia')}
              data-testid="dropdown-item-unichain-sepolia"
            >
              Unichain Sepolia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mantua"
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
          data-testid="input-chat-message"
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