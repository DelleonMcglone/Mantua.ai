import { Button } from "@/components/ui/button";
import { Sun, Moon, MessageSquarePlus, Package, User, Bot } from "lucide-react";
import { SiDiscord, SiX } from "react-icons/si";
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
          <img src={isDark ? logoWhite : logoBlack} alt="Mantua Protocol" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-foreground" data-testid="text-brand-name">
            Mantua.AI
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-discord"
            onClick={() => window.open('https://discord.com/channels/1423172421967413311/1423172423150342218', '_blank')}
            title="Discord"
          >
            <SiDiscord className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-x"
            onClick={() => window.open('https://x.com/Mantua_AI', '_blank')}
            title="X (Twitter)"
          >
            <SiX className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-farcaster"
            onClick={() => window.open('https://farcaster.xyz/mantuaprotocol.eth', '_blank')}
            title="Farcaster"
          >
            <svg className="h-4 w-4" viewBox="0 0 1000 1000" fill="currentColor">
              <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
              <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V351.111H331.111L360 253.333H128.889Z"/>
              <path d="M675.556 746.667V351.111H700L728.889 253.333H497.778L526.667 351.111H551.111V746.667C538.838 746.667 528.889 756.616 528.889 768.889V795.556H524.444C512.172 795.556 502.222 805.505 502.222 817.778V844.444H751.111V817.778C751.111 805.505 741.162 795.556 728.889 795.556H724.444V768.889C724.444 756.616 714.495 746.667 702.222 746.667H675.556Z"/>
            </svg>
          </Button>
          <Button
            variant="ghost"
            data-testid="button-about"
            onClick={() => setLocation('/about')}
          >
            About
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
      <main className="relative flex flex-col items-center justify-center px-8 py-16 text-center pb-96">
        {/* Logo */}
        <div className="mb-8">
          <img src={isDark ? logoWhite : logoBlack} alt="Mantua.AI" className="w-16 h-16 mx-auto" />
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Mantua.AI
            <br />
            programmable liquidity for DeFi
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

        {/* App Preview - Bleeding off bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-5xl w-full px-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <img src={isDark ? logoWhite : logoBlack} alt="Mantua.AI" className="w-6 h-6" />
                  <span className="text-sm font-medium text-foreground">Mantua.AI</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-muted px-3 py-1 rounded text-xs text-muted-foreground">Datadealer.base.eth</div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-muted/30 border-r p-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <MessageSquarePlus className="h-4 w-4" />
                      New chats
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Assets
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Activity
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Agent Activity
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-6 bg-background">
                  <div className="text-sm text-muted-foreground mb-8 text-right">
                    Swap ETH for USDC use the dynamic fee hook
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Sell</div>
                          <div className="text-2xl font-semibold">0.5</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground">Balance: ETH 0.0034</div>
                          <div className="flex items-center gap-1 bg-background rounded-lg px-3 py-1 border">
                            <span className="text-sm font-medium">ETH</span>
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">0.0567 ETH</span>
                        <span className="text-primary">Max</span>
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