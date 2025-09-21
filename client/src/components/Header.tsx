import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useConnect, useDisconnect, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { client, metamask, baseSepolia } from '../providers/ThirdwebProvider';

function WalletConnection() {
  const { connect, isConnecting, error } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  const shortenedAddress = account
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : "";

  const handleConnect = async () => {
    try {
      await connect(async () => {
        await metamask.connect({ client, chain: baseSepolia });
        return metamask;
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet);
    }
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground" data-testid="text-wallet-address">
          {shortenedAddress}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          data-testid="button-disconnect-wallet"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      data-testid="button-connect-wallet"
      onClick={handleConnect}
    >
      Connect wallet
    </Button>
  );
}

export default function Header() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);
  const [, setLocation] = useLocation();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  const handleLogoClick = () => {
    setLocation('/');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg p-2 -m-2" onClick={handleLogoClick} data-testid="button-logo-home">
        <img src={isDark ? logoBlack : logoWhite} alt="Mantua.AI" className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-foreground" data-testid="text-brand-name">
          Mantua.AI
        </h1>
      </div>

      <div className="flex items-center gap-3">
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
        <WalletConnection />
      </div>
    </header>
  );
}