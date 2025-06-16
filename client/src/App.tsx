import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import B2BProfile from "./pages/b2b-profile";
import AuthLogin from "./pages/auth-login";
import AuthRegisterB2B from "./pages/auth-register-b2b";
import AdminDashboard from "./pages/admin-dashboard";
import AdminUsers from "./pages/admin-users";
import AdminProducts from "./pages/admin-products";
import AdminOrders from "./pages/admin-orders";
import { lazy } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      {isAuthenticated && (
        <Route path="/profile" component={B2BProfile} />
      )}
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/auth/register" component={lazy(() => import("./pages/auth-register"))} />
      <Route path="/auth/register-b2b" component={AuthRegisterB2B} />
      {isAuthenticated && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
        </>
      )}
      <Route component={NotFound} />
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