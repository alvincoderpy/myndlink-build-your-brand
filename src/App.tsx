import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { DashboardLayout } from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import PasswordReset from "./pages/PasswordReset";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";

function lazyWithDebug<T extends { default: ComponentType }>(
  routeName: string,
  factory: () => Promise<T>,
) {
  return lazy(async () => {
    if (import.meta.env.DEV) {
      console.debug("[Route lazy] import:start", routeName);
    }
    try {
      const mod = await factory();
      if (import.meta.env.DEV) {
        console.debug("[Route lazy] import:resolved", routeName);
      }
      return mod;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("[Route lazy] import:error", routeName, error);
      }
      throw error;
    }
  });
}

const Home = lazyWithDebug("Home", () => import("./pages/Home"));
const Dashboard = lazyWithDebug("Dashboard", () => import("./pages/Dashboard"));
const StoreEditor = lazyWithDebug("StoreEditor", () => import("./pages/StoreEditor"));
const MyStore = lazyWithDebug("MyStore", () => import("./pages/MyStore"));
const Products = lazyWithDebug("Products", () => import("./pages/Products"));
const Orders = lazyWithDebug("Orders", () => import("./pages/Orders"));
const Invoices = lazyWithDebug("Invoices", () => import("./pages/Invoices"));
const Coupons = lazyWithDebug("Coupons", () => import("./pages/Coupons"));
const Settings = lazyWithDebug("Settings", () => import("./pages/Settings"));
const Templates = lazyWithDebug("Templates", () => import("./pages/Templates"));
const Storefront = lazyWithDebug("Storefront", () => import("./pages/Storefront"));
const Checkout = lazyWithDebug("Checkout", () => import("./pages/Checkout"));

const queryClient = new QueryClient();

function RouteFallback({ routeName }: { routeName: string }) {
  const location = useLocation();
  if (import.meta.env.DEV) {
    console.debug("[Suspense fallback] route loading", location.pathname, routeName);
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sm text-muted-foreground">
        Loading route: {routeName} ({location.pathname})
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <StoreProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                
                {/* Dashboard Routes with Layout */}
                <Route path="/dashboard" element={<Suspense fallback={<RouteFallback routeName="Home" />}><DashboardLayout><Home /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/analytics" element={<Suspense fallback={<RouteFallback routeName="Dashboard" />}><DashboardLayout><Dashboard /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/store" element={<Suspense fallback={<RouteFallback routeName="MyStore" />}><DashboardLayout><MyStore /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/store/edit" element={<Suspense fallback={<RouteFallback routeName="StoreEditor" />}><ErrorBoundary name="StoreEditor"><StoreEditor /></ErrorBoundary></Suspense>} />
                <Route path="/dashboard/products" element={<Suspense fallback={<RouteFallback routeName="Products" />}><DashboardLayout><Products /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/orders" element={<Suspense fallback={<RouteFallback routeName="Orders" />}><DashboardLayout><Orders /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/invoices" element={<Suspense fallback={<RouteFallback routeName="Invoices" />}><DashboardLayout><Invoices /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/coupons" element={<Suspense fallback={<RouteFallback routeName="Coupons" />}><DashboardLayout><Coupons /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/settings" element={<Suspense fallback={<RouteFallback routeName="Settings" />}><DashboardLayout><Settings /></DashboardLayout></Suspense>} />
                <Route path="/dashboard/templates" element={<Suspense fallback={<RouteFallback routeName="Templates" />}><DashboardLayout><Templates /></DashboardLayout></Suspense>} />
                
                {/* Public Storefront Routes */}
                <Route path="/store/:subdomain" element={<Suspense fallback={<RouteFallback routeName="Storefront" />}><Storefront /></Suspense>} />
                <Route path="/store/:subdomain/checkout" element={<Suspense fallback={<RouteFallback routeName="Checkout" />}><Checkout /></Suspense>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
