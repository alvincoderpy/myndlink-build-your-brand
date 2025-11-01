import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "./DashboardSidebar";
import { OnboardingCarousel } from "./OnboardingCarousel";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState<string>("");

  useEffect(() => {
    const loadStoreName = async () => {
      if (user) {
        const { data } = await supabase
          .from("stores")
          .select("name")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setStoreName(data.name);
        }
      }
    };
    loadStoreName();
  }, [user]);

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
    <div className="min-h-screen w-full bg-muted/30">
      <OnboardingCarousel />
      <DashboardSidebar />
      
      {/* Top Bar */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-card border-b border-border z-40">
        <div className="h-full px-6 flex items-center justify-end gap-4">
          <span className="text-sm text-muted-foreground">
            {storeName || user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};
