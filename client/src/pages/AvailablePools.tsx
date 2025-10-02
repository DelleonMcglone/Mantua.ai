import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft } from "lucide-react";

import ethereumLogo from '@assets/Frame 352 (1)_1758910668532.png';
import usdcLogo from '@assets/Frame 352_1758910679715.png';

interface Pool {
  id: string;
  token1: string;
  token2: string;
  fee: string;
  apr: string;
  tvl: string;
  volume24h: string;
  users: string;
  logo1: string;
  logo2: string;
}

const AVAILABLE_POOLS: Pool[] = [
  {
    id: 'eth-usdc-1',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  },
  {
    id: 'eth-usdc-2',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  },
  {
    id: 'eth-usdc-3',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  }
];

const MY_POOLS: Pool[] = [
  {
    id: 'my-eth-usdc-1',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  },
  {
    id: 'my-eth-usdc-2',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  },
  {
    id: 'my-eth-usdc-3',
    token1: 'ETH',
    token2: 'USDC',
    fee: '0.30%',
    apr: '12.7%',
    tvl: '2.4M',
    volume24h: '150k',
    users: '245',
    logo1: ethereumLogo,
    logo2: usdcLogo
  }
];

interface AvailablePoolsProps {
  onViewPool?: (poolId: string) => void;
  onBack?: () => void;
  inlineMode?: boolean;
}

export default function AvailablePools({ onViewPool, onBack, inlineMode = false }: AvailablePoolsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewPool = (poolId: string) => {
    if (onViewPool) {
      onViewPool(poolId);
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
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
        <h2 className="text-2xl font-semibold" data-testid="text-pools-title">Available pools</h2>
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

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-pool">Pool</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-apr">APR</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-tvl">TVL</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-volume">24h volume</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-users">Users</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground" data-testid="header-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_POOLS.map((pool) => (
                <tr key={pool.id} className="border-b hover-elevate" data-testid={`row-pool-${pool.id}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <img src={pool.logo1} alt={pool.token1} className="w-6 h-6 rounded-full border-2 border-background" />
                        <img src={pool.logo2} alt={pool.token2} className="w-6 h-6 rounded-full border-2 border-background" />
                      </div>
                      <div>
                        <div className="font-medium" data-testid={`text-pool-name-${pool.id}`}>{pool.token1}/{pool.token2}</div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-pool-fee-${pool.id}`}>Fee: {pool.fee}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-green-500 font-medium" data-testid={`text-apr-${pool.id}`}>{pool.apr}</span>
                  </td>
                  <td className="py-4 px-4" data-testid={`text-tvl-${pool.id}`}>{pool.tvl}</td>
                  <td className="py-4 px-4" data-testid={`text-volume-${pool.id}`}>{pool.volume24h}</td>
                  <td className="py-4 px-4" data-testid={`text-users-${pool.id}`}>{pool.users}</td>
                  <td className="py-4 px-4">
                    <Button 
                      size="sm"
                      onClick={() => handleViewPool(pool.id)}
                      data-testid={`button-view-pool-${pool.id}`}
                    >
                      View pool
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {MY_POOLS.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold" data-testid="text-my-pools-title">Added liquidity pools</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pool</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">APR</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">TVL</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">24h volume</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Users</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MY_POOLS.map((pool) => (
                    <tr key={pool.id} className="border-b hover-elevate" data-testid={`row-my-pool-${pool.id}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <img src={pool.logo1} alt={pool.token1} className="w-6 h-6 rounded-full border-2 border-background" />
                            <img src={pool.logo2} alt={pool.token2} className="w-6 h-6 rounded-full border-2 border-background" />
                          </div>
                          <div>
                            <div className="font-medium">{pool.token1}/{pool.token2}</div>
                            <div className="text-sm text-muted-foreground">Fee: {pool.fee}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-500 font-medium">{pool.apr}</span>
                      </td>
                      <td className="py-4 px-4">{pool.tvl}</td>
                      <td className="py-4 px-4">{pool.volume24h}</td>
                      <td className="py-4 px-4">{pool.users}</td>
                      <td className="py-4 px-4">
                        <Button 
                          size="sm"
                          onClick={() => handleViewPool(pool.id)}
                          data-testid={`button-view-my-pool-${pool.id}`}
                        >
                          View pool
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
