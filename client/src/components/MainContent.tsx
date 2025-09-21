import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import ActionButtons from "./ActionButtons";
import { useState, useEffect } from "react";
import { useActiveAccount } from 'thirdweb/react';
import { Button } from "@/components/ui/button";

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const account = useActiveAccount();

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

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!account) {
      setHasPrompted(false);
    }
  }, [account]);

  // Handle chat input submission
  const handleChatSubmit = (message: string) => {
    if (message.trim()) {
      setHasPrompted(true);
      // Here you would integrate with your chat/streaming logic
      console.log('Chat message submitted:', message);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Mantua Logo */}
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
        {account && !hasPrompted && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-greeting">
              Hi, {shortenedAddress}
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-ask-prompt">
              What can I help you with today?
            </p>
          </div>
        )}

        {/* State 3: After Prompt - Show Streaming Results */}
        {account && hasPrompted && (
          <div className="space-y-6 text-left w-full">
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-chat-header">
              Chat with Mantua.AI
            </h2>
            <div className="p-4 bg-muted rounded-lg" data-testid="div-streaming-results">
              <p className="text-muted-foreground">
                Streaming results will appear here...
              </p>
              {/* This is where your actual streaming logic would go */}
            </div>
          </div>
        )}

        {/* Chat Input - Show when wallet is connected */}
        {account && (
          <div className="space-y-6">
            <ChatInput onSubmit={handleChatSubmit} />
            <ActionButtons />
          </div>
        )}
      </div>
    </main>
  );
}