import { createContext, useContext, useState, ReactNode } from 'react';

export interface UserActivity {
  id: string;
  type: 'Swap' | 'Liquidity';
  assets: string;
  amounts: string;
  value: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: number;
}

export interface AgentActivity {
  id: string;
  activity: string;
  value: string;
  date: string;
  performance: string;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: number;
}

export interface PortfolioData {
  month: string;
  value: number;
}

export interface ActivityMessage {
  message: string;
  type: 'user' | 'agent';
  link: string;
}

interface ActivityContextType {
  // User Activity
  userActivities: UserActivity[];
  addUserActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;
  userPortfolioValue: number;
  userGainsLosses: number;
  userTransactionCount: number;
  userChartData: PortfolioData[];
  
  // Agent Activity
  agentActivities: AgentActivity[];
  addAgentActivity: (activity: Omit<AgentActivity, 'id' | 'timestamp'>, portfolioData?: { assets: string; amounts: string; type: 'Swap' | 'Liquidity' }) => void;
  agentCumulativeReturns: number;
  agentValueManaged: number;
  agentCommandsProcessed: number;
  agentChartData: PortfolioData[];
  
  // Activity messages for chat
  activityMessages: ActivityMessage[];
  addActivityMessage: (message: ActivityMessage) => void;
  clearActivityMessages: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [activityMessages, setActivityMessages] = useState<ActivityMessage[]>([]);
  
  // User Activity Functions
  const addUserActivity = (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newActivity: UserActivity = {
      ...activity,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setUserActivities(prev => [newActivity, ...prev]);
    
    // Add activity message for chat
    addActivityMessage({
      message: `Activity updated: ${activity.type} ${activity.assets} added to history`,
      type: 'user',
      link: '/user-activity'
    });
  };
  
  const addAgentActivity = (
    activity: Omit<AgentActivity, 'id' | 'timestamp'>, 
    portfolioData?: { assets: string; amounts: string; type: 'Swap' | 'Liquidity' }
  ) => {
    const newActivity: AgentActivity = {
      ...activity,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setAgentActivities(prev => [newActivity, ...prev]);
    
    // If portfolio data provided, also update user activities (dual-logging)
    if (portfolioData && activity.status === 'Completed') {
      const userActivity: UserActivity = {
        id: `user-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: portfolioData.type,
        assets: portfolioData.assets,
        amounts: portfolioData.amounts,
        value: activity.value,
        date: activity.date,
        status: activity.status,
        timestamp: Date.now(),
      };
      setUserActivities(prev => [userActivity, ...prev]);
    }
    
    // Add activity message for chat
    addActivityMessage({
      message: `Agent executed: ${activity.activity} (${activity.status})`,
      type: 'agent',
      link: '/agent-activity'
    });
  };
  
  const addActivityMessage = (message: ActivityMessage) => {
    setActivityMessages(prev => [...prev, message]);
  };
  
  const clearActivityMessages = () => {
    setActivityMessages([]);
  };
  
  // Calculate user metrics
  const userPortfolioValue = userActivities.reduce((sum, activity) => {
    if (activity.status === 'Completed') {
      const value = parseFloat(activity.value.replace(/[$,]/g, '')) || 0;
      return sum + value;
    }
    return sum;
  }, 0);
  
  const userGainsLosses = 0; // Placeholder - would need to track initial values
  const userTransactionCount = userActivities.filter(a => a.status === 'Completed').length;
  
  // Calculate agent metrics
  const agentValueManaged = agentActivities.reduce((sum, activity) => {
    if (activity.status === 'Completed') {
      const value = parseFloat(activity.value.replace(/[$,]/g, '')) || 0;
      return sum + value;
    }
    return sum;
  }, 0);
  
  const agentCumulativeReturns = 0; // Placeholder - would need historical data
  const agentCommandsProcessed = agentActivities.filter(a => a.status === 'Completed').length;
  
  // Generate chart data (simplified - last 7 months)
  const generateChartData = (activities: (UserActivity | AgentActivity)[]): PortfolioData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const currentMonth = new Date().getMonth();
    
    // Generate months starting from 6 months ago
    const chartMonths = months.slice(Math.max(0, currentMonth - 6), currentMonth + 1);
    while (chartMonths.length < 7) {
      chartMonths.unshift(months[(currentMonth - chartMonths.length + 12) % 12]);
    }
    
    // Calculate total value from completed activities
    const totalValue = activities.reduce((sum, activity) => {
      if (activity.status === 'Completed') {
        const value = parseFloat(activity.value.replace(/[$,]/g, '')) || 0;
        return sum + value;
      }
      return sum;
    }, 0);
    
    // Calculate cumulative value over time
    let cumulativeValue = 0;
    return chartMonths.map(month => {
      // In a real app, we'd filter activities by month
      // For now, distribute evenly
      if (activities.length > 0) {
        cumulativeValue += totalValue / chartMonths.length;
      }
      return { month, value: Math.round(cumulativeValue) };
    });
  };
  
  const userChartData = generateChartData(userActivities);
  const agentChartData = generateChartData(agentActivities);
  
  const value: ActivityContextType = {
    // User Activity
    userActivities,
    addUserActivity,
    userPortfolioValue,
    userGainsLosses,
    userTransactionCount,
    userChartData,
    
    // Agent Activity
    agentActivities,
    addAgentActivity,
    agentCumulativeReturns,
    agentValueManaged,
    agentCommandsProcessed,
    agentChartData,
    
    // Activity messages
    activityMessages,
    addActivityMessage,
    clearActivityMessages,
  };
  
  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
