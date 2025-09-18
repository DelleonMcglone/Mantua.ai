import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import logoUrl from "@assets/generated_images/Purple_Mantua_Protocol_logo_8c90b33a.png";
import { useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <img src={logoUrl} alt="Mantua Protocol" className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-foreground" data-testid="text-brand-name">
          Mantua Protocol
        </h1>
      </div>


      <div className="flex items-center gap-3">
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
          data-testid="button-connect-wallet"
          onClick={() => console.log('Connect wallet clicked')}
        >
          💳 Connect wallet
        </Button>
      </div>
    </header>
  );
}