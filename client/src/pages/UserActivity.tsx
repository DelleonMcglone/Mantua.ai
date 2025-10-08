import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivity, UserActivity as UserActivityType } from "@/contexts/ActivityContext";

type TimeRange = '24H' | '7D' | '1M' | '3M' | '1Y' | 'Max';

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

  // Filter activities by time range
  const getTimeRangeInMs = (range: TimeRange): number => {
    const now = Date.now();
    switch (range) {
      case '24H': return 24 * 60 * 60 * 1000;
      case '7D': return 7 * 24 * 60 * 60 * 1000;
      case '1M': return 30 * 24 * 60 * 60 * 1000;
      case '3M': return 90 * 24 * 60 * 60 * 1000;
      case '1Y': return 365 * 24 * 60 * 60 * 1000;
      case 'Max': return Infinity;
    }
  };

  const timeRangeMs = getTimeRangeInMs(timeRange);
  const cutoffTime = Date.now() - timeRangeMs;

  const timeFilteredActivities = userActivities.filter(
    activity => activity.timestamp >= cutoffTime
  );

  const filteredActivities = timeFilteredActivities.filter(activity => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Swaps') return activity.type === 'Swap';
    if (activeFilter === 'Liquidity pools') return activity.type === 'Liquidity';
    return true;
  });

  // Calculate filtered chart data based on time range
  const filteredChartData = useMemo(() => {
    if (timeFilteredActivities.length === 0) {
      return [{ month: 'Now', value: 0 }];
    }

    // Generate appropriate labels based on time range
    const getChartLabels = (): string[] => {
      if (timeRange === '24H') return Array.from({ length: 24 }, (_, i) => `${i}h`);
      if (timeRange === '7D') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (timeRange === '1M') return Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
      if (timeRange === '3M') return ['M1', 'M2', 'M3'];
      if (timeRange === '1Y') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return userChartData.map(d => d.month); // Max - use default
    };

    const labels = getChartLabels();
    const totalValue = timeFilteredActivities.reduce((sum, activity) => {
      if (activity.status === 'Completed') {
        const value = parseFloat(activity.value.replace(/[$,]/g, '')) || 0;
        return sum + value;
      }
      return sum;
    }, 0);

    // Distribute value across time periods
    let cumulativeValue = 0;
    return labels.map(label => {
      if (timeFilteredActivities.length > 0) {
        cumulativeValue += totalValue / labels.length;
      }
      return { month: label, value: Math.round(cumulativeValue) };
    });
  }, [timeFilteredActivities, timeRange, userChartData]);

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

            {/* Activity Table */}
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-activities">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Activity</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Assets</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Amounts</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-sm text-muted-foreground" data-testid="text-no-activities">
                        No activities yet
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-border" data-testid={`row-activity-${activity.id}`}>
                        <td className="py-3 text-sm">{activity.type}</td>
                        <td className="py-3 text-sm">{activity.assets}</td>
                        <td className="py-3 text-sm">{activity.amounts}</td>
                        <td className="py-3 text-sm">{activity.value}</td>
                        <td className="py-3 text-sm">{activity.date}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
