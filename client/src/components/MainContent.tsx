import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import ActionButtons from "./ActionButtons";
import { useState, useEffect } from "react";

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);

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

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-title">
            Meet Mantua,
          </h1>
          <h2 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-subtitle">
            your personal DeFi Assistant
          </h2>
          
        </div>

        {/* Chat Input */}
        <div className="space-y-6">
          <ChatInput />
          <ActionButtons />
        </div>
      </div>
    </main>
  );
}