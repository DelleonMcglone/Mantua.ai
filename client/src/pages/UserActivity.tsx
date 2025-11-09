import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRightLeft, Droplets, ExternalLink, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivity, UserActivity as UserActivityType } from "@/contexts/ActivityContext";
import { txUrl } from "@/utils/explorers";
import { baseSepolia } from "wagmi/chains";

type TimeRange = '24H' | '7D' | '1M' | '3M' | '1Y' | 'Max';

// Helper function to get activity icon and color
function getActivityIcon(type: 'Swap' | 'Liquidity', assets: string) {
  if (type === 'Swap') {
    return {
      icon: ArrowRightLeft,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    };
  }

  // For liquidity, check if it's add or remove
  const isRemove = assets.toLowerCase().includes('remove') || assets.toLowerCase().includes('withdrew');

  if (isRemove) {
    return {
      icon: Minus,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    };
  }

  return {
    icon: Plus,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
  };
}

// Helper function to format date as relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export default function UserActivity() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Swaps' | 'Liquidity pools'>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('Max');
  
  const { 
    userActivities, 
    userPortfolioValue, 
    userGainsLosses, 
    userTransactionCount,
    userChartData 
  } = useActivity();

  // Filter chart data by time range
  const filteredChartData = useMemo(() => {
    if (timeRange === 'Max') {
      return userChartData; // Show all data for Max
    }

    // Chart data is monthly, so map ranges to appropriate month counts
    const getDataPointCount = (range: TimeRange): number => {
      switch (range) {
        case '24H': return 1;  // Last day ≈ last month for monthly data
        case '7D': return 1;   // Last week ≈ last month
        case '1M': return 1;   // Last month
        case '3M': return 3;   // Last 3 months
        case '1Y': return Math.min(12, userChartData.length); // Last year (capped at available data)
        default: return userChartData.length;
      }
    };

    const pointCount = getDataPointCount(timeRange);
    
    // Slice the chart data to show only recent points
    return userChartData.slice(-pointCount);
  }, [userChartData, timeRange]);

  // Filter activities by type
  const filteredActivities = userActivities.filter(activity => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Swaps') return activity.type === 'Swap';
    if (activeFilter === 'Liquidity pools') return activity.type === 'Liquidity';
    return true;
  });

  const totalValue = `$${userPortfolioValue.toFixed(2)}`;
  const gainsLosses = `$${userGainsLosses.toFixed(2)}`;
  const transactionCount = userTransactionCount;

  const getStatusColor = (status: UserActivityType['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'Failed':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/app')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">
              Your activity
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
              View your recent transactions and interactions with Mantua protocol.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="card-portfolio-value">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total portfolio value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-portfolio-value">
                {totalValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0%</p>
            </CardContent>
          </Card>

          <Card data-testid="card-gains-losses">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Overall gains/losses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-gains-losses">
                {gainsLosses}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0%</p>
            </CardContent>
          </Card>

          <Card data-testid="card-transactions">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-transaction-count">
                {transactionCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0%</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Value Over Time Chart */}
        <Card data-testid="card-chart">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base">Portfolio value overtime</CardTitle>
                <div className="text-2xl font-semibold mt-2" data-testid="text-chart-value">
                  {totalValue}
                </div>
                <p className="text-xs text-muted-foreground">+0%</p>
              </div>
              
              {/* Time Range Buttons */}
              <div className="flex gap-1" data-testid="div-time-range-buttons">
                {(['24H', '7D', '1M', '3M', '1Y', 'Max'] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="min-w-[3rem]"
                    data-testid={`button-timerange-${range.toLowerCase()}`}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-4" data-testid="div-activity-filters">
              {(['All', 'Swaps', 'Liquidity pools'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-sm pb-2 border-b-2 transition-colors ${
                    activeFilter === filter
                      ? 'border-primary text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`button-filter-${filter.toLowerCase().replace(' ', '-')}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Activity List */}
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground" data-testid="text-no-activities">
                  <div className="flex flex-col items-center gap-2">
                    <Droplets className="h-8 w-8 text-muted-foreground/50" />
                    <p>No activities yet</p>
                    <p className="text-xs">Your swaps and liquidity actions will appear here</p>
                  </div>
                </div>
              ) : (
                filteredActivities.map((activity) => {
                  const { icon: Icon, color, bgColor } = getActivityIcon(activity.type, activity.assets);
                  const relativeTime = formatRelativeTime(activity.date);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      data-testid={`row-activity-${activity.id}`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${bgColor}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{activity.type}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{relativeTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">${activity.value}</p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="text-sm text-foreground">
                          <p className="font-medium">{activity.assets}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{activity.amounts}</p>
                        </div>

                        {/* Transaction Link */}
                        {activity.transactionHash && (
                          <div className="pt-2">
                            <a
                              href={txUrl(baseSepolia, activity.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              View transaction
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
