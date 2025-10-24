import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThirdwebProviders } from "./providers/ThirdwebProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { ActivityProvider } from "@/contexts/ActivityContext";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './config/wagmi';
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import About from "@/pages/About";
import UserActivity from "@/pages/UserActivity";
import AgentActivity from "@/pages/AgentActivity";
import Agents from "@/pages/Agents";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/user-activity" component={UserActivity} />
      <Route path="/agent-activity" component={AgentActivity} />
      <Route path="/agents" component={Agents} />
      {/* Chat routes - /chat/new and /chat/:id */}
      <Route path="/chat/:id" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProviders>
          <ActivityProvider>
            <ChatProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ChatProvider>
          </ActivityProvider>
        </ThirdwebProviders>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
