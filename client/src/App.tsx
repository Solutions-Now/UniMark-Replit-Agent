import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import StudentsIndex from "@/pages/students/index";
import StudentsForm from "@/pages/students/form";
import ParentsIndex from "@/pages/parents/index";
import ParentsForm from "@/pages/parents/form";
import DriversIndex from "@/pages/drivers/index";
import DriversForm from "@/pages/drivers/form";
import BusRoundsIndex from "@/pages/bus-rounds/index";
import BusRoundsForm from "@/pages/bus-rounds/form";
import LiveTracking from "@/pages/live-tracking";
import Notifications from "@/pages/notifications";
import ActivityLogs from "@/pages/activity-logs";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/students" component={StudentsIndex} />
      <ProtectedRoute path="/students/new" component={StudentsForm} />
      <ProtectedRoute path="/students/:id" component={StudentsForm} />
      <ProtectedRoute path="/parents" component={ParentsIndex} />
      <ProtectedRoute path="/parents/new" component={ParentsForm} />
      <ProtectedRoute path="/parents/:id" component={ParentsForm} />
      <ProtectedRoute path="/drivers" component={DriversIndex} />
      <ProtectedRoute path="/drivers/new" component={DriversForm} />
      <ProtectedRoute path="/drivers/:id" component={DriversForm} />
      <ProtectedRoute path="/bus-rounds" component={BusRoundsIndex} />
      <ProtectedRoute path="/bus-rounds/new" component={BusRoundsForm} />
      <ProtectedRoute path="/bus-rounds/:id" component={BusRoundsForm} />
      <ProtectedRoute path="/live-tracking" component={LiveTracking} />
      <ProtectedRoute path="/notifications" component={Notifications} />
      <ProtectedRoute path="/activity-logs" component={ActivityLogs} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
