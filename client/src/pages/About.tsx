import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function About() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    window.history.length > 1 ? window.history.back() : setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 -ml-2"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-about-title">
            About Mantua.AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The programmable liquidity layer for DeFi.<br />
            Hooks for logic. Agents for action. AI for intelligence.
          </p>

          <hr className="border-border my-8" />

          {/* What is Mantua.AI */}
          <h2 className="text-2xl font-bold text-foreground mb-4">What is Mantua.AI</h2>
          <p className="text-foreground mb-6 leading-relaxed">
            Mantua.AI is a natural language operating system for decentralized finance — a place where you can swap, manage liquidity, deploy hooks, and interact with smart contracts simply by typing what you want.
          </p>
          <p className="text-foreground mb-8 leading-relaxed">Built on Base Sepolia, Mantua.AI connects the intelligence of AI with the autonomy of blockchain. It combines Uniswap v4 Hooks, AI Agents, and on-chain data reasoning to make DeFi intuitive, automated, and intelligent.</p>

          {/* The Problem */}
          <h2 className="text-2xl font-bold text-foreground mb-4">The Problem</h2>
          <p className="text-foreground mb-6 leading-relaxed">
            DeFi today is powerful but fragmented.
          </p>
          <p className="text-foreground mb-8 leading-relaxed">
            Each task — swapping, adding liquidity, analyzing tokens, deploying contracts — requires juggling multiple dashboards, APIs, and wallets. Even experienced users spend time copying addresses, checking gas, and debugging failed transactions.
          </p>
          <p className="text-foreground mb-8 leading-relaxed">
            For newcomers, it's overwhelming. For builders, it's inefficient. For investors, it's slow.
          </p>

          {/* Our Solution */}
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Solution</h2>
          <p className="text-foreground mb-6 leading-relaxed">
            Mantua.AI turns complex DeFi workflows into natural conversations.
          </p>
          <div className="space-y-4 mb-8">
            <p className="text-foreground leading-relaxed">
              <strong>Type it.</strong> "Swap 1 ETH for USDC using a dynamic fee hook."
            </p>
            <p className="text-foreground leading-relaxed">
              <strong>Understand it.</strong> Mantua's AI parses your intent, simulates outcomes, and explains what's happening.
            </p>
            <p className="text-foreground leading-relaxed">
              <strong>Execute it.</strong> Your transaction is safely built and sent on-chain — on your approval.
            </p>
          </div>
          <p className="text-foreground mb-8 leading-relaxed">
            No more guesswork, no more copy-pasting contract addresses. Just AI-powered precision, fully on-chain.
          </p>

          {/* Who It's For */}
          <h2 className="text-2xl font-bold text-foreground mb-4">Who It's For</h2>
          <ul className="space-y-3 mb-8">
            <li className="text-foreground leading-relaxed">
              <strong>Liquidity Providers</strong>
            </li>
            <li className="text-foreground leading-relaxed">
              <strong>Hook Focused Devs</strong>
            </li>
            <li className="text-foreground leading-relaxed">
              <strong>Everyday Users</strong>
            </li>
          </ul>

          {/* Our Vision */}
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
          <p className="text-foreground mb-6 leading-relaxed">
            Mantua.AI is more than an app — it's the foundation for AI-native DeFi.
          </p>
          <p className="text-foreground mb-6 leading-relaxed">
            We're building toward a world where liquidity is programmable, execution is autonomous, and intelligence is embedded into every transaction.
          </p>
          <p className="text-foreground mb-8 leading-relaxed">
            DeFi shouldn't be hard — it should be smart.
          </p>

          {/* Join the Movement */}
          <h2 className="text-2xl font-bold text-foreground mb-4">Join the Movement</h2>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://t.me/+uG4bi2BDzNxmYmVh', '_blank')}
              data-testid="button-telegram-join"
            >
              💬 Telegram
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://x.com/Mantua_AI', '_blank')}
              data-testid="button-x-join"
            >
              🐦 X (Twitter)
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://farcaster.xyz/mantuaprotocol.eth', '_blank')}
              data-testid="button-farcaster-join"
            >
              🌐 Farcaster
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
