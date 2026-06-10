import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NewTryOn from "@/pages/NewTryOn";
import TryOnResult from "@/pages/TryOnResult";
import Inventory from "@/pages/Inventory";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/">
          {user ? <Redirect to="/dashboard" /> : <Landing />}
        </Route>
        <Route path="/dashboard">
          {!user ? <Redirect to="/" /> : <Dashboard />}
        </Route>
        <Route path="/new">
          {!user ? <Redirect to="/" /> : <NewTryOn />}
        </Route>
        <Route path="/try-ons/:id">
          {!user ? <Redirect to="/" /> : <TryOnResult />}
        </Route>
        <Route path="/inventory">
          {!user ? <Redirect to="/" /> : <Inventory />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
