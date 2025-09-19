import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);
  const [, setLocation] = useLocation();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLaunchApp = () => {
    setLocation('/app');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b bg-background">
        <div className="flex items-center gap-3">
          <img src={isDark ? logoBlack : logoWhite} alt="Mantua Protocol" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-foreground" data-testid="text-brand-name">
            Mantua Protocol
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            data-testid="button-community"
            onClick={() => console.log('Community clicked')}
          >
            Community
          </Button>
          <Button
            variant="ghost"
            data-testid="button-docs"
            onClick={() => console.log('Docs clicked')}
          >
            Docs
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-launch-app-header"
            onClick={handleLaunchApp}
          >
            Launch App
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-8 py-16 text-center">
        {/* Built on Base Badge */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Built on Base Sepolia
          </div>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            The programmable
            <br />
            liquidity layer for DeFi
          </h1>
        </div>

        {/* Subtitle */}
        <div className="max-w-2xl mb-12">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Hooks for logic. Agents for action. AI for intelligence.
          </p>
        </div>

        {/* Launch App Button */}
        <Button 
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold rounded-lg"
          data-testid="button-launch-app-hero"
          onClick={handleLaunchApp}
        >
          Launch app
        </Button>

        {/* App Preview */}
        <div className="mt-20 max-w-5xl w-full">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <img src={isDark ? logoBlack : logoWhite} alt="Mantua Protocol" className="w-6 h-6" />
                  <span className="text-sm font-medium text-foreground">Mantua Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>User activity</span>
                    <span>Agent activity</span>
                  </div>
                  <div className="text-xs text-muted-foreground">xxxyyy...23brul</div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-muted/30 border-r p-4">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Search</div>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      New chats
                    </div>
                    <div className="text-sm text-muted-foreground">Assets</div>
                    <div className="text-sm text-muted-foreground">Settings</div>
                    <div className="mt-8 text-xs text-muted-foreground uppercase tracking-wide">
                      RECENTS
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    Swap ETH for USDC using my custom hook
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-semibold">0.5</div>
                        <div className="text-xs text-muted-foreground">~$0.37 ETH</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">ETH</span>
                          <div className="text-xs text-primary">Max</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Balance: ETH 0.0034</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}