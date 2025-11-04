import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PoolsListProps {
  tokenFilter?: string;
}

const hooks = [
  "Mantua Intel Hook",
  "Dynamic Fee Hook",
  "TWAMM Hook",
  "MEV Protection Hook",
  "—",
];

const randomHook = () => hooks[Math.floor(Math.random() * hooks.length)];

const allPools = [
  { id: 1, pair: "ETH/USDC", protocol: "v4", fee: "0.05%", tvl: "$5.9M", apr: "18.9%", vol1d: "$6.1M", vol30d: "$304.8M" },
  { id: 2, pair: "USDC/USDT", protocol: "v4", fee: "0.0008%", tvl: "$18.8M", apr: "0.83%", vol1d: "$53.6M", vol30d: "$1.6B" },
  { id: 3, pair: "WBTC/USDT", protocol: "v4", fee: "0.3%", tvl: "$3.2M", apr: "21.1%", vol1d: "$614K", vol30d: "$12.1M" },
  { id: 4, pair: "cbBTC/ETH", protocol: "v4", fee: "0.3%", tvl: "$2.1M", apr: "16.4%", vol1d: "$382K", vol30d: "$9.1M" },
  { id: 5, pair: "EVA/USDT", protocol: "v4", fee: "0.3%", tvl: "$1.9M", apr: "46.0%", vol1d: "$784K", vol30d: "$5.2M" },
  { id: 6, pair: "ARB/ETH", protocol: "v4", fee: "0.05%", tvl: "$2.8M", apr: "9.2%", vol1d: "$952K", vol30d: "$27.1M" },
  { id: 7, pair: "OP/USDC", protocol: "v4", fee: "0.3%", tvl: "$3.8M", apr: "13.8%", vol1d: "$611K", vol30d: "$19.2M" },
  { id: 8, pair: "sUSD/DAI", protocol: "v4", fee: "0.01%", tvl: "$2.0M", apr: "0.06%", vol1d: "$32.8K", vol30d: "$1.4M" },
  { id: 9, pair: "PEPE/USDC", protocol: "v4", fee: "1.00%", tvl: "$1.5M", apr: "25.4%", vol1d: "$1.8M", vol30d: "$56.9M" },
  { id: 10, pair: "ETH/WBTC", protocol: "v4", fee: "0.05%", tvl: "$3.1M", apr: "5.7%", vol1d: "$971K", vol30d: "$54.9M" },
];

export default function PoolsList({ tokenFilter }: PoolsListProps) {
  const poolsWithHooks = useMemo(
    () => allPools.map((p) => ({ ...p, hook: randomHook() })),
    []
  );

  const filteredPools = useMemo(() => {
    if (!tokenFilter) return poolsWithHooks;
    const filter = tokenFilter.toLowerCase();
    return poolsWithHooks.filter((p) => p.pair.toLowerCase().includes(filter));
  }, [tokenFilter, poolsWithHooks]);

  const getHookBadgeVariant = (hook: string) => {
    if (hook === "—") return "outline";
    if (hook === "Mantua Intel Hook") return "default";
    return "secondary";
  };

  return (
    <Card className="w-full max-w-6xl" data-testid="component-pools-list">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-foreground">
          {tokenFilter ? `Pools matching "${tokenFilter.toUpperCase()}"` : "Top Liquidity Pools"}
        </h2>

        {filteredPools.length === 0 ? (
          <p className="text-muted-foreground" data-testid="text-no-pools">
            No pools found for this token or pair.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-pools">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pool</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Protocol</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Fee</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">TVL</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pool APR</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Hook</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">1D Vol</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">30D Vol</th>
                </tr>
              </thead>

              <tbody>
                {filteredPools.map((pool, index) => (
                  <tr
                    key={pool.id}
                    className="border-b border-border hover-elevate transition-colors"
                    data-testid={`row-pool-${pool.id}`}
                  >
                    <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-2 font-medium text-foreground">{pool.pair}</td>
                    <td className="py-3 px-2 text-foreground">{pool.protocol}</td>
                    <td className="py-3 px-2 text-foreground">{pool.fee}</td>
                    <td className="py-3 px-2 text-foreground">{pool.tvl}</td>
                    <td className="py-3 px-2 text-foreground">{pool.apr}</td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={getHookBadgeVariant(pool.hook)} 
                        className="text-xs"
                        data-testid={`badge-hook-${pool.id}`}
                      >
                        {pool.hook}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-foreground">{pool.vol1d}</td>
                    <td className="py-3 px-2 text-foreground">{pool.vol30d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
