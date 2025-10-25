import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft } from "lucide-react";

import ethereumLogo from '@assets/Frame 352 (1)_1758910668532.png';
import usdcLogo from '@assets/Frame 352_1758910679715.png';
import cbbtcLogo from '@assets/Frame 352 (2)_1758910679714.png';

type HookIdentifier = 'dynamic-fee' | 'twamm' | 'mev-protection';

export interface AvailablePool {
  id: string;
  token1: string;
  token2: string;
  feeTierDisplay: string;
  feeTierValue: string;
  apr: string;
  tvl: string;
  volume24h: string;
  users: string;
  hookLabel: string;
  hookId?: HookIdentifier;
  logo1: string;
  logo2: string;
}

const AVAILABLE_POOLS: readonly AvailablePool[] = [
  {
    id: 'eth-usdc',
    token1: 'ETH',
    token2: 'USDC',
    feeTierDisplay: '0.30%',
    feeTierValue: '0.30',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    hookLabel: 'None',
    logo1: ethereumLogo,
    logo2: usdcLogo,
  },
  {
    id: 'eth-cbbtc-dynamic-fee',
    token1: 'ETH',
    token2: 'cbBTC',
    feeTierDisplay: '0.30%',
    feeTierValue: '0.30',
    apr: '13.1%',
    tvl: '1.8M',
    volume24h: '98k',
    users: '167',
    hookLabel: 'Dynamic Fee',
    hookId: 'dynamic-fee',
    logo1: ethereumLogo,
    logo2: cbbtcLogo,
  },
  {
    id: 'eth-cbbtc-twamm',
    token1: 'ETH',
    token2: 'cbBTC',
    feeTierDisplay: '0.30%',
    feeTierValue: '0.30',
    apr: '11.4%',
    tvl: '2.0M',
    volume24h: '120k',
    users: '180',
    hookLabel: 'TWAMM',
    hookId: 'twamm',
    logo1: ethereumLogo,
    logo2: cbbtcLogo,
  },
  {
    id: 'usdc-cbbtc-mev',
    token1: 'USDC',
    token2: 'cbBTC',
    feeTierDisplay: '0.05%',
    feeTierValue: '0.05',
    apr: '14.2%',
    tvl: '2.9M',
    volume24h: '240k',
    users: '295',
    hookLabel: 'MEV Protection',
    hookId: 'mev-protection',
    logo1: usdcLogo,
    logo2: cbbtcLogo,
  },
] as const;

const MY_POOLS: readonly AvailablePool[] = [
  {
    id: 'my-eth-usdc',
    token1: 'ETH',
    token2: 'USDC',
    feeTierDisplay: '0.30%',
    feeTierValue: '0.30',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    hookLabel: 'None',
    logo1: ethereumLogo,
    logo2: usdcLogo,
  },
];

interface AvailablePoolsProps {
  onViewPool?: (pool: AvailablePool) => void;
  onBack?: () => void;
  inlineMode?: boolean;
  initialSearchQuery?: string;
}

export default function AvailablePools({
  onViewPool,
  onBack,
  inlineMode = false,
  initialSearchQuery = "",
}: AvailablePoolsProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  useEffect(() => {
    setSearchQuery(initialSearchQuery ?? "");
  }, [initialSearchQuery]);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const availablePools = useMemo(() => {
    if (!normalizedQuery) return AVAILABLE_POOLS;
    return AVAILABLE_POOLS.filter((pool) => {
      const poolName = `${pool.token1}/${pool.token2}`.toLowerCase();
      const hook = pool.hookLabel.toLowerCase();
      return (
        poolName.includes(normalizedQuery) ||
        hook.includes(normalizedQuery) ||
        pool.apr.toLowerCase().includes(normalizedQuery) ||
        pool.tvl.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const myPools = useMemo(() => {
    if (!normalizedQuery) return MY_POOLS;
    return MY_POOLS.filter((pool) => {
      const poolName = `${pool.token1}/${pool.token2}`.toLowerCase();
      const hook = pool.hookLabel.toLowerCase();
      return (
        poolName.includes(normalizedQuery) ||
        hook.includes(normalizedQuery) ||
        pool.apr.toLowerCase().includes(normalizedQuery) ||
        pool.tvl.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const paddingClass = inlineMode ? 'p-4' : 'p-6';

  const renderPoolRow = (pool: AvailablePool, context: 'available' | 'my') => {
    const hookDisplay = pool.hookId ? `${pool.hookLabel} 🪝` : pool.hookLabel;
    const baseTestId = context === 'available' ? 'pool' : 'my-pool';

    return (
      <tr
        key={`${context}-${pool.id}`}
        className="border-b last:border-0 transition hover:bg-muted/40"
        data-testid={`row-${baseTestId}-${pool.id}`}
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src={pool.logo1} alt={pool.token1} className="w-8 h-8 rounded-full border-2 border-background" />
              <img src={pool.logo2} alt={pool.token2} className="w-8 h-8 rounded-full border-2 border-background" />
            </div>
            <div>
              <div className="font-medium" data-testid={`text-pool-name-${pool.id}`}>
                {pool.token1}/{pool.token2}
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`text-pool-fee-${pool.id}`}>
                Fee: {pool.feeTierDisplay}
              </div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4" data-testid={`text-hook-${pool.id}`}>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">{hookDisplay}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-green-500 font-medium" data-testid={`text-apr-${pool.id}`}>
            {pool.apr}
          </span>
        </td>
        <td className="py-4 px-4" data-testid={`text-tvl-${pool.id}`}>
          {pool.tvl}
        </td>
        <td className="py-4 px-4" data-testid={`text-volume-${pool.id}`}>
          {pool.volume24h}
        </td>
        <td className="py-4 px-4" data-testid={`text-users-${pool.id}`}>
          {pool.users}
        </td>
        <td className="py-4 px-4">
          <Button
            size="sm"
            onClick={() => onViewPool?.(pool)}
            data-testid={`button-view-${baseTestId}-${pool.id}`}
          >
            View pool
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <div className={`w-full space-y-6 ${paddingClass}`}>
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" data-testid="text-pools-title">
          Available pools
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="text-pools-subtitle">
          View your recent transactions and interactions with Mantua protocol.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search pool"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-pool"
        />
      </div>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border shadow-sm" data-testid="container-available-pools">
          <table className="w-full">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-pool">
                  Pool
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-hook">
                  Hook Type
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-apr">
                  APR
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-tvl">
                  TVL
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-volume">
                  24h volume
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-users">
                  Users
                </th>
                <th className="text-left py-3 px-4 font-medium" data-testid="header-status">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {availablePools.length > 0 ? (
                availablePools.map((pool) => renderPoolRow(pool, 'available'))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-sm text-muted-foreground" data-testid="text-no-pools">
                    No pools match your search yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {myPools.length > 0 && (
          <div className="space-y-4" data-testid="section-my-pools">
            <h3 className="text-lg font-semibold" data-testid="text-my-pools-title">
              Added liquidity pools
            </h3>
            <div className="overflow-hidden rounded-2xl border shadow-sm">
              <table className="w-full">
                <thead className="bg-foreground text-background">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Pool</th>
                    <th className="text-left py-3 px-4 font-medium">Hook Type</th>
                    <th className="text-left py-3 px-4 font-medium">APR</th>
                    <th className="text-left py-3 px-4 font-medium">TVL</th>
                    <th className="text-left py-3 px-4 font-medium">24h volume</th>
                    <th className="text-left py-3 px-4 font-medium">Users</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {myPools.map((pool) => renderPoolRow(pool, 'my'))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
