import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { StoreSelector } from "./StoreSelector";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const {
    user,
    loading
  } = useAuth();
  const {
    currentStore
  } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="min-h-screen w-full bg-muted/30">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Top Bar */}
      <header className={`fixed top-0 left-0 right-0 h-16 bg-card border-b-2 border-border z-40`}>
        <div className={`h-full px-6 flex items-center justify-center gap-4 ${!isMobile ? 'ml-64' : ''}`}>
          {isMobile && <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="absolute left-4">
              <Menu className="w-5 h-5" />
            </Button>}
          
          <div className="w-full max-w-xs px-[52px]">
            <StoreSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${isMobile ? 'ml-0' : 'ml-64'} mt-16 p-8 min-h-screen animate-fade-in`}>
        {children}
      </main>
    </div>;
};