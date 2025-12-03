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
  return <div className="h-screen w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-50"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}

      {/* Main Content with Rounded Borders - Static Container */}
      <main className={`${isMobile ? 'ml-0 p-3' : 'ml-64 pr-4 py-4'} h-screen animate-fade-in`}>
        <div className="bg-background rounded-2xl shadow-lg border border-border h-[calc(100vh-2rem)] relative overflow-hidden flex flex-col">
          
          {/* Liquid Glass Header - Fixed at top */}
          <div className="sticky top-0 z-10 h-14 liquid-glass rounded-t-2xl flex-shrink-0" />
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            {children}
          </div>
          
          {/* Liquid Glass Footer - Blur no FUNDO */}
          <div className="sticky bottom-0 z-10 h-14 liquid-glass-bottom rounded-b-2xl flex-shrink-0" />
          
        </div>
      </main>
    </div>;
};