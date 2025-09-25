import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import { useState, useEffect, useRef } from "react";
import { useActiveAccount } from 'thirdweb/react';
import { Button } from "@/components/ui/button";
import { useChatContext } from '@/contexts/ChatContext';
import { useLocation } from 'wouter';
import type { ChatMessage } from '@/lib/chatManager';

type ActionId = 'swap' | 'add-liquidity' | 'explore-agent' | 'what-can-mantua-do' | 'learn-about-hooks' | 'analyze-uniswap-v4';

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);
  const { currentChat, addMessage, updateAgentMode } = useChatContext();
  const [location] = useLocation();
  const account = useActiveAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived state from current chat
  const hasPrompted = currentChat ? currentChat.messages.length > 0 : false;
  const isAgentMode = currentChat ? currentChat.isAgentMode : false;
  const chatMessages = currentChat ? currentChat.messages : [];

  // Debug logging
  useEffect(() => {
    console.log(`[MainContent] State update:`, {
      hasAccount: !!account,
      currentChatId: currentChat?.id,
      messageCount: chatMessages.length,
      hasPrompted,
      location
    });
  }, [account, currentChat, chatMessages, hasPrompted, location]);

  const shortenedAddress = account
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : "";

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Note: We don't need to reset chat state when wallet disconnects
  // since each chat maintains its own state through the chat context
  // The wallet connection is checked in the UI rendering logic

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Mock assistant responses
  const getMockAssistantResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're asking about DeFi operations. Let me help you with that.",
      "Great question! In the DeFi space, there are several approaches to consider...",
      "I can help you navigate that DeFi strategy. Here's what I recommend...",
      "That's an excellent point about liquidity management. Let me explain the options...",
      "For yield farming and staking, here are the key considerations...",
      "Regarding swap operations, I can guide you through the best practices...",
      "Token analysis shows some interesting patterns. Here's my assessment...",
      "Risk management is crucial in DeFi. Let me break down the key factors..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle action button clicks with predefined content
  const handleActionClick = (actionId: string) => {
    if (!currentChat) return; // No active chat to add messages to

    if (actionId === 'explore-agent') {
      // Enter Agent mode
      updateAgentMode(true);
      return;
    }
    
    const actionContent = getActionContent(actionId as ActionId);
    if (actionContent) {
      // Add assistant response immediately for action buttons
      addMessage({
        content: actionContent,
        sender: 'assistant'
      });
    } else {
      console.error(`Unknown action ID: ${actionId}`);
      // Add error message to chat
      addMessage({
        content: "Sorry, I don't understand that action. Please try one of the available options.",
        sender: 'assistant'
      });
    }
  };

  // Get predefined content for action buttons
  const getActionContent = (actionId: ActionId): string => {
    switch (actionId) {
      case 'swap':
        return `Execute token swaps with intelligent routing and optional hooks.

**Standard Swaps:**
• Swap ETH for USDC with best execution
• Swap USDC for cbBTC using optimal routes
• Multi-hop swaps across liquidity pools

**Hook-Enhanced Swaps:**
• Dynamic fee swaps that adjust based on volatility
• MEV-protected swaps with time-weighted pricing
• Limit order swaps with automated execution

**Available on Base Sepolia testnet with full mainnet feature parity.**`;

      case 'add-liquidity':
        return `Provide liquidity to earn fees and participate in DeFi protocols.

**Standard Liquidity:**
• Add liquidity to ETH/USDC pools
• Earn trading fees from swaps
• Withdraw anytime with accumulated rewards

**Hook-Enhanced Liquidity:**
• Dynamic fee pools that maximize returns
• Automated rebalancing strategies
• Custom liquidity management hooks

**Range Orders:**
• Set price ranges for concentrated liquidity
• Maximize capital efficiency
• Automated position management

**Get started with testnet tokens or use the faucet for initial funding.**`;

      case 'what-can-mantua-do':
        return `Mantua.AI is the programmable liquidity layer for DeFi.
It combines AI reasoning, Uniswap v4 hooks, and onchain agents to give you natural-language control over liquidity.
Here are some example actions you can perform with Mantua:

Swap
Execute swaps with or without hooks.
- Swap ETH for USDC using a dynamic fee hook
- Swap ETH for cbBTC (standard swap, no hook)

Deploy
Spin up hooks and agents directly from chat.
- Create a new Uniswap v4 pool with a custom dynamic fee hook
- Launch an agent that can:
  • Request testnet funds via faucet
  • Manage wallet details and balance checks
  • Execute trades

Understand
Analyze contracts, pools, and hooks.
- What hooks are active in the ETH/USDC pool on Base?
- What ERC standards does contract 0x5932...627f implement?
- Show me the total liquidity in my deployed pool

Interact
Query balances and wallet info.
- How much ETH is in my wallet?
- What is the current value of my LP position in the ETH/USDC pool?

Explore
Access blockchain-level data and activity.
- What's the current gas price on Base?
- Show the last 10 transactions for my wallet
- Get details for transaction 0xdfc4...9e04

Research
Retrieve token, protocol, and market insights.
- What's the market price of ETH on Base?
- Compare TVL between ETH/USDC pools on Base vs Unichain
- Show me recent volume trends for cbBTC on Base`;
      
      case 'learn-about-hooks':
        return `Hooks are custom pieces of logic that extend Uniswap v4 pools and in some cases swaps.
They let developers and traders add intelligence, protection, and new features directly into liquidity.
Here are some examples of what you can do with hooks:

Dynamic Fee Hook
Adjust fees automatically based on market conditions.
- Charge higher fees during volatility, lower fees during calm periods
Example: Swap ETH for USDC using a dynamic fee hook

TWAP (Time-Weighted Average Price) Hook
Smooth out execution with oracle-like pricing.
- Execute trades against an average price over time
Example: Swap ETH for cbBTC with a TWAP hook enabled

MEV Protection Hook
Defend liquidity providers and traders from front-running.
- Add guardrails against sandwich attacks
Example: Enable MEV protection in an ETH/USDC pool

Custom Hooks
Design and deploy your own logic.
- Add loyalty rewards or fee splits for LPs
- Create hooks that restrict trades to whitelisted addresses
- Combine multiple hooks into one pool for tailored behavior

Pool-Level Insights
Use hooks to unlock new data.
- Track LP activity directly inside pools
- View how hooks change swap execution and fee distribution`;
      
      case 'analyze-uniswap-v4':
        return `Uniswap v4 Overview (Base)
What changed from v3 → v4: v4 introduces a singleton architecture via the PoolManager, so pools live inside one contract; and hooks let builders add programmable logic (dynamic fees, MEV protection, etc.) at the pool level. Gas usage is reduced with native "flash accounting," and liquidity positions move to ERC-1155 (vs v3's ERC-721). (Uniswap Docs)

Ethereum mainnet anchor (context): The canonical PoolManager on Ethereum mainnet is 0x000000000004444C5dC75cB358380D2e3DE08A90. If you're reading v4 articles or SDK examples, they often reference this address. (Ethereum (ETH) Blockchain Explorer)

Core Uniswap v4 Components (what Mantua users will see)
- PoolManager (singleton): single entry point for swaps, mints/burns, and pool state.
- PositionManager (ERC-1155): creates/manages LP positions.
- Quoter: off-chain pricing and quote simulation.
- StateView: read-only state helpers for pools/positions.
- Universal Router: user-facing router for swaps/liquidity.
- Permit2: shared approvals/allowances used across chains. (Uniswap Docs)

Uniswap v4 — Contract Addresses on Base

Base Mainnet (Chain ID 8453)
PoolManager: 0x498581fF718922C3f8E6A244956Af099b2652B2B
PositionDescriptor: 0x25D093633990dC94bEDEeD76C8F3cdaa75F3E7D5
PositionManager: 0x7C5F5A4bbD8Fd63184577525326123b519429Bdc
Quoter: 0x0D5E0F971ed27FbfF6c2837BF31316121532048D
StateView: 0xA3C0c9B65Bad0B08107aA264b0F3DB444B867a71
Universal Router: 0x6fF5693b99212Da76ad316178A184AB56D299b43
Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3

Base Sepolia (Testnet, Chain ID 84532)
PoolManager: 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408
PositionManager: 0x4b2C77D209d3405F41A037eC6C77F7F5B8E2cA80
Quoter: 0x4A6513C898fE1B2D0E78D3B0E0A4a151589B1cBa
StateView: 0x571291B572eD32cE6751a2cB2486eBEE8defB9B4
Universal Router: 0x492E6456D9528771018DeB9E87ef7750EF184104
Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3
Source: Uniswap v4 official deployments (Uniswap Docs)`;
      
      case 'explore-agent':
        // This is handled separately in handleActionClick
        return "";
      
      default:
        // This should never happen with proper TypeScript typing
        const _exhaustiveCheck: never = actionId;
        return "";
    }
  };

  // Handle agent action button clicks
  const handleAgentAction = (action: string) => {
    if (!currentChat) return; // No active chat to add messages to
    
    addMessage({
      content: `Executing agent action: ${action}`,
      sender: 'assistant'
    });
  };

  // Exit Agent mode
  const exitAgentMode = () => {
    updateAgentMode(false);
  };

  // Handle chat input submission
  const handleChatSubmit = (message: string) => {
    if (!currentChat || !message.trim()) return; // No active chat or empty message
    
    // Add user message
    addMessage({
      content: message.trim(),
      sender: 'user'
    });
    
    // Add mock assistant response after a short delay
    setTimeout(() => {
      addMessage({
        content: getMockAssistantResponse(message),
        sender: 'assistant'
      });
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col bg-background min-h-0">
      {hasPrompted && currentChat ? (
        /* Full-width chat layout */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat messages container */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0" data-testid="div-chat-messages">
            <div className="max-w-4xl mx-auto space-y-4">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted text-foreground shadow-sm'
                    }`}
                    data-testid={`message-${message.sender}-${message.id}`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Fixed input at bottom */}
          <div className="border-t bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Agent action buttons directly above input when in Agent mode */}
              {isAgentMode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="text-sm py-2"
                    onClick={() => handleAgentAction('Request testnet funds via faucet')}
                    data-testid="button-agent-faucet"
                  >
                    Request testnet funds via faucet
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm py-2"
                    onClick={() => handleAgentAction('Manage wallet details and balance checks')}
                    data-testid="button-agent-wallet"
                  >
                    Manage wallet details and balance checks
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm py-2"
                    onClick={() => handleAgentAction('Execute token transfers and trades')}
                    data-testid="button-agent-trades"
                  >
                    Execute token transfers and trades
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <ChatInput 
                  onSubmit={account ? handleChatSubmit : undefined} 
                  onQuickAction={handleActionClick}
                  isAgentMode={isAgentMode}
                  onExitAgent={exitAgentMode}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Centered layout for States 1 & 2 */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Mantua Logo - only show when not in chat mode */}
            <div className="flex justify-center mb-8">
              <img 
                src={isDark ? logoBlack : logoWhite} 
                alt="Mantua.AI" 
                className="w-16 h-16" 
                data-testid="img-mantua-logo"
              />
            </div>

            {/* State 1: Not Connected - Show Hero Message */}
            {!account && (
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-title">
                  Meet Mantua.AI,
                </h1>
                <h2 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-subtitle">
                  your personal DeFi Assistant
                </h2>
                <p className="text-lg text-muted-foreground mt-6" data-testid="text-connect-prompt">
                  Connect your wallet to get started
                </p>
              </div>
            )}

            {/* State 2: Connected but No Prompt - Show Greeting */}
            {account && !hasPrompted && !currentChat && (
              <div className="space-y-6">
                <h1 className="text-3xl font-semibold text-foreground" data-testid="text-greeting">
                  Hi, {shortenedAddress}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-ask-prompt">
                  What can I help you with today?
                </p>
              </div>
            )}

            {/* State 3: Not Connected and No Chat - Show Connect Prompt */}
            {!account && !currentChat && (
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground text-center" data-testid="text-connect-prompt">
                  Connect your wallet to get started
                </p>
              </div>
            )}

            {/* Chat Input - Show when there's a current chat OR wallet is connected */}
            {(currentChat || account) && (
              <div className="space-y-6">
                <ChatInput 
                  onSubmit={account ? handleChatSubmit : undefined} 
                  onQuickAction={handleActionClick}
                  isAgentMode={isAgentMode}
                  onExitAgent={exitAgentMode}
                />
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}