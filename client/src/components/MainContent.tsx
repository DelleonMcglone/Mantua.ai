import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import SwapPage from "@/pages/Swap";
import AddLiquidityPage from "@/pages/AddLiquidity";
import { useState, useEffect, useRef } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";

type ActionId = 'swap' | 'add-liquidity' | 'explore-agents' | 'analyze';

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);
  const [activeComponent, setActiveComponent] = useState<null | "swap" | "liquidity">(null);
  const [swapProps, setSwapProps] = useState<any>(null);
  const [liquidityProps, setLiquidityProps] = useState<any>(null);
  const { currentChat, addMessage, updateAgentMode, createNewChat } = useChatContext();
  const [location] = useLocation();
  const account = useActiveAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingChatIdRef = useRef<string | null>(null);
  const previousChatIdRef = useRef<string | null>(null);

  const isWalletConnected = Boolean(account);

  // Derived state from current chat
  const chatMessages = currentChat ? currentChat.messages : [];
  const messageCount = chatMessages.length;
  const hasPrompted = isWalletConnected && messageCount > 0;
  const isAgentMode = Boolean(currentChat?.isAgentMode);

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

  useEffect(() => {
    if (currentChat?.id) {
      pendingChatIdRef.current = currentChat.id;
    }
  }, [currentChat?.id]);

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

  // Reset transient UI state when switching between chat threads
  useEffect(() => {
    const newChatId = currentChat?.id ?? null;

    if (!newChatId) {
      setActiveComponent(null);
      setSwapProps(null);
      setLiquidityProps(null);
      previousChatIdRef.current = null;
      return;
    }

    if (
      previousChatIdRef.current &&
      previousChatIdRef.current !== newChatId
    ) {
      setActiveComponent(null);
      setSwapProps(null);
      setLiquidityProps(null);
    }

    previousChatIdRef.current = newChatId;
  }, [currentChat?.id]);

  // Auto-scroll to bottom when new messages are added and the wallet is connected
  useEffect(() => {
    if (!isWalletConnected || !currentChat) return;
    if (chatMessages.length === 0) return;

    // Keep the most recent exchange in view without abrupt jumps
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentChat?.id, isWalletConnected]);

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
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return; // No active chat to add messages to

    if (actionId === 'explore-agents') {
      // Enter Agent mode
      updateAgentMode(true, activeChatId);
      return;
    }
    
    const actionContent = getActionContent(actionId as ActionId);
    
    // Add assistant response only if there's content
    if (actionContent) {
      addMessage({
        content: actionContent,
        sender: 'assistant'
      }, activeChatId);
    }
    
    // Handle component activation for swap
    if (actionId === 'swap') {
      // Always set default props for button-triggered swap
      setSwapProps({ sellToken: '', buyToken: '', showCustomHook: false });
      if (activeComponent !== 'swap') {
        setActiveComponent('swap');
      }
    }
    
    // Handle component activation for add-liquidity
    if (actionId === 'add-liquidity') {
      // Always set default props for button-triggered liquidity
      setLiquidityProps({ token1: '', token2: '', showCustomHook: false });
      if (activeComponent !== 'liquidity') {
        setActiveComponent('liquidity');
      }
    }
  };

  // Get predefined content for action buttons
  const getActionContent = (actionId: ActionId): string => {
    switch (actionId) {
      case 'swap':
        return ''; // No intro text for swap - just show component

      case 'add-liquidity':
        return ''; // No intro text for add liquidity - just show component

      case 'analyze':
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
      
      case 'explore-agents':
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
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return; // No active chat to add messages to
    
    addMessage({
      content: `Executing agent action: ${action}`,
      sender: 'assistant'
    }, activeChatId);
  };

  // Exit Agent mode
  const exitAgentMode = () => {
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return;
    updateAgentMode(false, activeChatId);
  };

  // Intent parsing for swap commands
  const parseSwapIntent = (message: string) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Basic "swap" command
    if (lowerMessage === 'swap') {
      return { type: 'swap', sellToken: '', buyToken: '', showCustomHook: false };
    }
    
    // "Swap X for Y" pattern
    const swapForPattern = /swap\s+(\w+)\s+for\s+(\w+)/i;
    const swapForMatch = message.match(swapForPattern);
    if (swapForMatch) {
      const [, sellToken, buyToken] = swapForMatch;
      const hasCustomHook = lowerMessage.includes('custom hook') || lowerMessage.includes('my custom hook');
      return {
        type: 'swap',
        sellToken: sellToken.toUpperCase(),
        buyToken: buyToken.toUpperCase(),
        selectedHook: hasCustomHook ? 'custom' : '',
        showCustomHook: hasCustomHook
      };
    }
    
    return null;
  };

  // Intent parsing for liquidity commands
  const parseLiquidityIntent = (message: string) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Basic "add liquidity" command
    if (lowerMessage === 'add liquidity' || lowerMessage === 'provide liquidity') {
      return { type: 'liquidity', token1: '', token2: '', showCustomHook: false };
    }
    
    // "Add Liquidity X/Y" or "Add Liquidity ETH/USDC" pattern
    const liquidityPattern = /(?:add|provide)\s+liquidity\s+(\w+)\/(\w+)/i;
    const liquidityMatch = message.match(liquidityPattern);
    if (liquidityMatch) {
      const [, token1, token2] = liquidityMatch;
      const hasCustomHook = lowerMessage.includes('custom hook') || lowerMessage.includes('my custom hook');
      return {
        type: 'liquidity',
        token1: token1.toUpperCase(),
        token2: token2.toUpperCase(),
        selectedHook: hasCustomHook ? 'custom' : '',
        showCustomHook: hasCustomHook
      };
    }
    
    return null;
  };

  // Handle chat input submission
  const handleChatSubmit = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Empty message

    const swapIntent = parseSwapIntent(trimmedMessage);
    const liquidityIntent = parseLiquidityIntent(trimmedMessage);

    let chatForMessage = currentChat;

    if (!chatForMessage) {
      console.log(
        `[MainContent] No active chat found, creating new chat for message: ${trimmedMessage}`,
      );
      const newChat = createNewChat();
      if (!newChat) return;
      chatForMessage = newChat;
    }

    const chatId = chatForMessage.id;
    pendingChatIdRef.current = chatId;

    const isSystemConnectPrompt =
      trimmedMessage === "Please connect your wallet to continue.";

    addMessage(
      {
        content: trimmedMessage,
        sender: !isWalletConnected && isSystemConnectPrompt ? "assistant" : "user",
      },
      chatId,
    );

    if (!isWalletConnected) {
      return;
    }

    if (swapIntent) {
      setSwapProps(swapIntent);
      if (activeComponent !== "swap") {
        setActiveComponent("swap");
      }
      return;
    }

    if (liquidityIntent) {
      setLiquidityProps(liquidityIntent);
      if (activeComponent !== "liquidity") {
        setActiveComponent("liquidity");
      }
      return;
    }

    setTimeout(() => {
      addMessage(
        {
          content: getMockAssistantResponse(trimmedMessage),
          sender: "assistant",
        },
        chatId,
      );
    }, 800);
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
              
                {/* Render active component */}
                {activeComponent === 'swap' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-swap-active">
                        <SwapPage 
                          initialSellToken={swapProps?.sellToken}
                          initialBuyToken={swapProps?.buyToken}
                          initialSelectedHook={swapProps?.selectedHook}
                          initialShowCustomHook={swapProps?.showCustomHook}
                          inlineMode={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeComponent === 'liquidity' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-liquidity-active">
                        <AddLiquidityPage 
                          initialToken1={liquidityProps?.token1}
                          initialToken2={liquidityProps?.token2}
                          initialSelectedHook={liquidityProps?.selectedHook}
                          initialShowCustomHook={liquidityProps?.showCustomHook}
                          inlineMode={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Fixed input at bottom */}
            <div className="border-t bg-background p-4">
              <div className="max-w-4xl mx-auto space-y-3">
                {!account ? (
                  /* Wallet disconnected - show reconnection message */
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground" data-testid="text-wallet-required">
                      Reconnect your wallet to interact with saved chats.
                    </p>
                  </div>
                ) : (
                  <>
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
                        onSubmit={handleChatSubmit} 
                        onQuickAction={handleActionClick}
                        isAgentMode={isAgentMode}
                        onExitAgent={exitAgentMode}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
      ) : (
        /* Centered layout for States 1 & 2 */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center space-y-8">
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

            {/* Chat Input - Only available when wallet is connected */}
            {account && (
              <div className="space-y-6">
                <ChatInput 
                  onSubmit={handleChatSubmit} 
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
