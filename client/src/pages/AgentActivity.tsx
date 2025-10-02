import { useState } from "react";
import { ArrowLeft, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivity, AgentActivity as AgentActivityType } from "@/contexts/ActivityContext";

export default function AgentActivity() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Swaps' | 'Liquidity pools'>('All');
  const [isPaused, setIsPaused] = useState(false);
  
  const { 
    agentActivities, 
    agentCumulativeReturns, 
    agentValueManaged, 
    agentCommandsProcessed,
    agentChartData 
  } = useActivity();

  const filteredActivities = agentActivities.filter(activity => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Swaps') return activity.activity.includes('Swap');
    if (activeFilter === 'Liquidity pools') return activity.activity.includes('Liquidity');
    return true;
  });

  const cumulativeReturns = `${agentCumulativeReturns.toFixed(1)}%`;
  const totalValueManaged = `$${agentValueManaged.toFixed(2)}`;
  const commandsProcessed = agentCommandsProcessed;

  const getStatusColor = (status: AgentActivityType['status']) => {
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

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
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
              Agent activity
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
              Monitor and manage your AI agents' performance and actions.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="card-cumulative-returns">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Cumulative returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-cumulative-returns">
                {cumulativeReturns}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0%</p>
            </CardContent>
          </Card>

          <Card data-testid="card-value-managed">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total value managed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-value-managed">
                {totalValueManaged}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0%</p>
            </CardContent>
          </Card>

          <Card data-testid="card-commands-processed">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Commands Processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-commands-processed">
                {commandsProcessed}
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
              {totalValueManaged}
            </div>
            <p className="text-xs text-muted-foreground">+0%</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agentChartData}>
                  <defs>
                    <linearGradient id="colorAgentValue" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorAgentValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card data-testid="card-active-agents">
          <CardHeader>
            <CardTitle className="text-base">Active agents</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-4" data-testid="div-agent-filters">
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
              <table className="w-full" data-testid="table-agent-activities">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Activity</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Performance</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground" data-testid="text-no-agent-activities">
                        No agent activities yet
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-border" data-testid={`row-agent-activity-${activity.id}`}>
                        <td className="py-3 text-sm">{activity.activity}</td>
                        <td className="py-3 text-sm">{activity.value}</td>
                        <td className="py-3 text-sm">{activity.date}</td>
                        <td className="py-3 text-sm">{activity.performance}</td>
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

        {/* Pause Agent Activity Button */}
        <Card data-testid="card-pause-agent" className={isPaused ? 'border-destructive' : ''}>
          <CardContent className="p-6">
            <Button
              variant={isPaused ? "default" : "destructive"}
              onClick={handlePauseToggle}
              className="w-full"
              data-testid="button-pause-agent"
            >
              <Pause className="h-4 w-4 mr-2" />
              {isPaused ? 'Resume agent activity' : 'Pause agent activity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
