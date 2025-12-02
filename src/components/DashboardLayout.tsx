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
  return <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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

      {/* Main Content with Rounded Borders */}
      <main className={`${isMobile ? 'ml-0 p-3' : 'ml-56 p-4'} min-h-screen animate-fade-in`}>
        <div className="bg-background rounded-2xl shadow-lg border border-border p-4 md:p-5 min-h-[calc(100vh-2rem)]">
          {children}
        </div>
      </main>
    </div>;
};