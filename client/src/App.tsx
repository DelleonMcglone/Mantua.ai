import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThirdwebProviders } from "./providers/ThirdwebProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Home} />
      {/* Chat routes - /chat/new and /chat/:id */}
      <Route path="/chat/:id" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThirdwebProviders>
      <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ChatProvider>
    </ThirdwebProviders>
  );
}

export default App;
