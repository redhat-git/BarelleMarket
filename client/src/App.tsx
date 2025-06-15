import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import B2BProfile from "@/pages/b2b-profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminProducts from "@/pages/admin-products";
import AdminOrders from "@/pages/admin-orders";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={() => <div className="min-h-screen flex items-center justify-center">Loading...</div>} />
      ) : (
        <>
          <Route path="/" component={isAuthenticated ? Home : Landing} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          {isAuthenticated && (
            <Route path="/profile" component={B2BProfile} />
          )}
          {isAuthenticated && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/products" component={AdminProducts} />
              <Route path="/admin/orders" component={AdminOrders} />
            </>
          )}
          <Route component={NotFound} />
        </>
      )}
    </Switch>
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
