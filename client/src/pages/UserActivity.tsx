import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivity, UserActivity as UserActivityType } from "@/contexts/ActivityContext";

export default function UserActivity() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Swaps' | 'Liquidity pools'>('All');
  
  const { 
    userActivities, 
    userPortfolioValue, 
    userGainsLosses, 
    userTransactionCount,
    userChartData 
  } = useActivity();

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
            <CardTitle className="text-base">Portfolio value overtime</CardTitle>
            <div className="text-2xl font-semibold" data-testid="text-chart-value">
              {totalValue}
            </div>
            <p className="text-xs text-muted-foreground">+0%</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userChartData}>
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
