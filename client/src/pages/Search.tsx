import { useState } from "react";
import { Search as SearchIcon, Diamond, DollarSign, Bitcoin, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock token data
interface Token {
  symbol: string;
  name: string;
  IconComponent: typeof Diamond;
}

const MOCK_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    IconComponent: Diamond
  },
  {
    symbol: "USDC", 
    name: "USDC",
    IconComponent: DollarSign
  },
  {
    symbol: "cbBTC",
    name: "cbBTC", 
    IconComponent: Bitcoin
  },
  {
    symbol: "EURC",
    name: "EURC",
    IconComponent: Euro
  }
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tokens based on search query (case-insensitive)
  const filteredTokens = MOCK_TOKENS.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenClick = (token: Token) => {
    console.log("Token selected:", token);
  };

  return (
    <main className="flex-1 flex flex-col bg-background min-h-0">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-search-title">
              Search Tokens
            </h1>
            <p className="text-muted-foreground" data-testid="text-search-subtitle">
              Search for tokens by name or symbol
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search token by name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              data-testid="input-token-search"
            />
          </div>

          {/* Token List */}
          <div className="space-y-2" data-testid="div-token-list">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <div
                  key={token.symbol}
                  onClick={() => handleTokenClick(token)}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover-elevate cursor-pointer transition-colors"
                  data-testid={`button-token-${token.symbol.toLowerCase()}`}
                >
                  {/* Token Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <token.IconComponent className="h-5 w-5 text-foreground" />
                  </div>
                  
                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground" data-testid={`text-token-name-${token.symbol.toLowerCase()}`}>
                      {token.name}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-token-symbol-${token.symbol.toLowerCase()}`}>
                      {token.symbol}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12" data-testid="div-no-results">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-medium text-foreground mb-2">No tokens found</div>
                <div className="text-muted-foreground">
                  Try searching for a different token name or symbol
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}