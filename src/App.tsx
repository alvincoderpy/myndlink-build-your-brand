import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { DashboardLayout } from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StoreEditor from "./pages/StoreEditor";
import MyStore from "./pages/MyStore";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Coupons from "./pages/Coupons";
import PasswordReset from "./pages/PasswordReset";
import UpdatePassword from "./pages/UpdatePassword";
import Storefront from "./pages/Storefront";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/dashboard/store" element={<DashboardLayout><MyStore /></DashboardLayout>} />
          <Route path="/dashboard/store/edit" element={<StoreEditor />} />
                <Route path="/dashboard/products" element={<DashboardLayout><Products /></DashboardLayout>} />
                <Route path="/dashboard/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
                <Route path="/dashboard/coupons" element={<DashboardLayout><Coupons /></DashboardLayout>} />
                <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
                
                {/* Public Storefront Routes */}
                <Route path="/store/:subdomain" element={<Storefront />} />
                <Route path="/store/:subdomain/checkout" element={<Checkout />} />
                
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
