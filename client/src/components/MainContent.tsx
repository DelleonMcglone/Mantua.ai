import logoUrl from "@assets/generated_images/Purple_Mantua_Protocol_logo_8c90b33a.png";
import ChatInput from "./ChatInput";
import ActionButtons from "./ActionButtons";

export default function MainContent() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Mantua Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoUrl} 
            alt="Mantua Protocol" 
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
          <p className="text-muted-foreground text-lg" data-testid="text-welcome-description">
            Your DeFi assistant for hooks, swaps, and programmable liquidity.
          </p>
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