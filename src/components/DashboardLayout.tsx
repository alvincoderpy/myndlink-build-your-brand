import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="-ml-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SidebarTrigger>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 animate-fade-in">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
