import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Coins,
  BarChart3,
  Droplets,
  Network,
  ArrowRightLeft,
  Activity,
  DollarSign
} from "lucide-react";

interface AnalyzeInterfaceProps {
  onQuerySubmit: (query: string) => void;
  isLoading?: boolean;
}

interface QueryExample {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  query: string;
  badge?: string;
}

const QUERY_EXAMPLES: QueryExample[] = [
  {
    id: "token-prices",
    category: "Token Prices",
    icon: DollarSign,
    label: "Get ETH & BTC Prices",
    description: "View current prices for Ethereum and Bitcoin",
    query: "What is the price of ethereum and bitcoin?",
    badge: "Popular"
  },
  {
    id: "token-usdc",
    category: "Token Prices",
    icon: Coins,
    label: "USDC Price Data",
    description: "Get USDC price with confidence score",
    query: "Show me the price of USDC",
  },
  {
    id: "protocol-uniswap",
    category: "Protocols",
    icon: Network,
    label: "Uniswap Analysis",
    description: "View Uniswap TVL across all chains",
    query: "Analyze Uniswap protocol",
  },
  {
    id: "protocol-trending",
    category: "Protocols",
    icon: TrendingUp,
    label: "Top Protocols",
    description: "See leading protocols by TVL growth",
    query: "What are the top protocol movers this week?",
    badge: "Trending"
  },
  {
    id: "pools-eth-btc",
    category: "Liquidity Pools",
    icon: Droplets,
    label: "ETH/BTC Pools",
    description: "Find ETH/BTC liquidity pools on Base",
    query: "Find ETH BTC pools on Base",
  },
  {
    id: "pools-trending",
    category: "Liquidity Pools",
    icon: Activity,
    label: "Trending Pools",
    description: "View top pools by TVL on Base",
    query: "Show me trending pools on Base",
    badge: "Popular"
  },
  {
    id: "dex-volumes",
    category: "DEX Data",
    icon: BarChart3,
    label: "DEX Volumes",
    description: "Compare trading volumes across DEXes",
    query: "Show DEX volumes for Ethereum",
  },
  {
    id: "chain-tvl",
    category: "Chain Analytics",
    icon: ArrowRightLeft,
    label: "Chain TVL Growth",
    description: "See which chains are growing fastest",
    query: "Show me chain TVL growth",
    badge: "Insights"
  },
];

const CATEGORIES = [
  "All",
  "Token Prices",
  "Protocols",
  "Liquidity Pools",
  "DEX Data",
  "Chain Analytics"
] as const;

export function AnalyzeInterface({ onQuerySubmit, isLoading }: AnalyzeInterfaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("All");

  const filteredExamples = selectedCategory === "All"
    ? QUERY_EXAMPLES
    : QUERY_EXAMPLES.filter(ex => ex.category === selectedCategory);

  const handleExampleClick = (query: string) => {
    if (!isLoading) {
      onQuerySubmit(query);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analyze Mode Active
          </CardTitle>
          <CardDescription className="text-base">
            Get real-time DeFi insights powered by DeFiLlama. Ask questions about token prices, protocols, liquidity pools, DEX volumes, and chain analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Data Sources:</span>
            <Badge variant="secondary" className="font-mono text-xs">
              DeFiLlama API
            </Badge>
            <Badge variant="outline" className="text-xs">
              No API Key Required
            </Badge>
            <Badge variant="outline" className="text-xs">
              Free & Unlimited
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            disabled={isLoading}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Query Examples Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {filteredExamples.map((example) => {
          const Icon = example.icon;
          return (
            <Card
              key={example.id}
              className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
              onClick={() => handleExampleClick(example.query)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {example.label}
                      </CardTitle>
                    </div>
                  </div>
                  {example.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {example.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  {example.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border border-border/50 group-hover:border-primary/30 transition-colors">
                  "{example.query}"
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Query Help */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Custom Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              You can also ask custom questions in the chat input:
            </p>
            <ul className="space-y-1 list-disc list-inside ml-2">
              <li>
                <span className="font-mono text-foreground">"What's the TVL for Aave?"</span>
              </li>
              <li>
                <span className="font-mono text-foreground">"Show me the highest APY pools on Arbitrum"</span>
              </li>
              <li>
                <span className="font-mono text-foreground">"Compare prices for ETH, USDC, and DAI"</span>
              </li>
              <li>
                <span className="font-mono text-foreground">"What are the trading volumes for Uniswap?"</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Coverage Info */}
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">What You Can Analyze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <DollarSign className="h-3 w-3 text-primary" />
                Token Prices
              </div>
              <p className="text-muted-foreground">
                Real-time prices with confidence scores
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Network className="h-3 w-3 text-primary" />
                Protocols
              </div>
              <p className="text-muted-foreground">
                TVL, chains, and historical data
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Droplets className="h-3 w-3 text-primary" />
                Yield Pools
              </div>
              <p className="text-muted-foreground">
                APY, TVL, volume, and rewards
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <BarChart3 className="h-3 w-3 text-primary" />
                DEX Analytics
              </div>
              <p className="text-muted-foreground">
                Trading volumes and trends
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Fetching data from DeFiLlama...</span>
          </div>
        </div>
      )}
    </div>
  );
}
