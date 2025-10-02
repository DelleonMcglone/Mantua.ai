export default function About() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="text-about-title">
          About Mantua.AI
        </h1>
        
        {/* Introduction */}
        <p className="text-lg text-foreground mb-8 leading-relaxed">
          Mantua.AI is the programmable liquidity layer for DeFi.<br />
          It combines AI reasoning, Uniswap v4 hooks, and onchain agents to give you natural-language control over liquidity.
        </p>

        <hr className="border-border my-8" />

        {/* Example Actions Section */}
        <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-example-actions-title">
          Example Actions
        </h2>

        {/* Swap */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Swap</h3>
          <p className="text-muted-foreground mb-2">Execute swaps with or without hooks.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Swap ETH for USDC using a dynamic fee hook</li>
            <li>Swap ETH for cbBTC (standard swap, no hook)</li>
          </ul>
        </div>

        {/* Deploy */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Deploy</h3>
          <p className="text-muted-foreground mb-2">Spin up hooks and agents directly from chat.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Create a new Uniswap v4 pool with a custom dynamic fee hook</li>
            <li>Launch an agent that can:</li>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-8">
              <li>Request testnet funds via faucet</li>
              <li>Manage wallet details and balance checks</li>
              <li>Execute trades</li>
            </ul>
          </ul>
        </div>

        {/* Understand */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Understand</h3>
          <p className="text-muted-foreground mb-2">Analyze contracts, pools, and hooks.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>What hooks are active in the ETH/USDC pool on Base?</li>
            <li>What ERC standards does contract 0x5932...627f implement?</li>
            <li>Show me the total liquidity in my deployed pool</li>
          </ul>
        </div>

        {/* Interact */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Interact</h3>
          <p className="text-muted-foreground mb-2">Query balances and wallet info.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>How much ETH is in my wallet?</li>
            <li>What is the current value of my LP position in the ETH/USDC pool?</li>
          </ul>
        </div>

        {/* Explore */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Explore</h3>
          <p className="text-muted-foreground mb-2">Access blockchain-level data and activity.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>What's the current gas price on Base?</li>
            <li>Show the last 10 transactions for my wallet</li>
            <li>Get details for transaction 0xdfc4...9e04</li>
          </ul>
        </div>

        {/* Research */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3">Research</h3>
          <p className="text-muted-foreground mb-2">Retrieve token, protocol, and market insights.</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>What's the market price of ETH on Base?</li>
            <li>Compare TVL between ETH/USDC pools on Base vs Unichain</li>
            <li>Show me recent volume trends for cbBTC on Base</li>
          </ul>
        </div>

        <hr className="border-border my-8" />

        {/* Hooks Overview Section */}
        <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-hooks-overview-title">
          Hooks Overview
        </h2>

        <p className="text-muted-foreground mb-4 leading-relaxed">
          Hooks are custom pieces of logic that extend Uniswap v4 pools and in some cases swaps.<br />
          They let developers and traders add intelligence, protection, and new features directly into liquidity.
        </p>

        <p className="text-foreground font-semibold mb-3">Examples of hooks:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
          <li><strong className="text-foreground">Dynamic Fee Hook:</strong> Adjust fees automatically based on volatility.</li>
          <li><strong className="text-foreground">TWAP Hook:</strong> Smooth execution using time-weighted averages.</li>
          <li><strong className="text-foreground">MEV Protection Hook:</strong> Add protection against front-running.</li>
          <li><strong className="text-foreground">Custom Hooks:</strong> Deploy custom logic (whitelists, rewards, splits).</li>
          <li><strong className="text-foreground">Pool-Level Insights:</strong> Track LP activity and execution behavior.</li>
        </ul>
      </div>
    </div>
  );
}
