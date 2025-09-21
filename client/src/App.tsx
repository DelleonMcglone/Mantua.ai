import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnchainProviders } from "./providers/OnchainKitProvider";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import '@coinbase/onchainkit/styles.css';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <OnchainProviders>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </OnchainProviders>
  );
}

export default App;
