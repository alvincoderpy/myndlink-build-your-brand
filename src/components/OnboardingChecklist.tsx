import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link: string;
  completed: boolean;
}
export const OnboardingChecklist = () => {
  const {
    user
  } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([{
    id: "create_store",
    title: "Criar primeira loja",
    description: "Configure o nome e subdomínio",
    link: "/dashboard/store/edit",
    completed: false
  }, {
    id: "edit_store",
    title: "Editar loja",
    description: "Personalize cores e template",
    link: "/dashboard/store/edit",
    completed: false
  }, {
    id: "add_product",
    title: "Adicionar primeiro produto",
    description: "Adicione pelo menos 1 produto",
    link: "/dashboard/products",
    completed: false
  }, {
    id: "publish_store",
    title: "Publicar loja",
    description: "Torne sua loja visível ao público",
    link: "/dashboard/store/edit",
    completed: false
  }]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
    checkProgress();
  }, [user]);
  const checkProgress = async () => {
    if (!user) return;
    try {
      // Check if store exists
      const {
        data: store
      } = await supabase.from("stores").select("*").eq("user_id", user.id).single();

      // Check if products exist
      const {
        data: products,
        count
      } = await supabase.from("products").select("*", {
        count: "exact",
        head: true
      }).eq("store_id", store?.id);
      setItems(prev => prev.map(item => {
        if (item.id === "create_store") {
          return {
            ...item,
            completed: !!store
          };
        }
        if (item.id === "edit_store") {
          const templateConfig = store?.template_config as any;
          const hasCustomColors = store && templateConfig && (
            templateConfig.primaryColor || 
            templateConfig.secondaryColor || 
            templateConfig.accentColor
          );
          return {
            ...item,
            completed: !!hasCustomColors
          };
        }
        if (item.id === "add_product") {
          return {
            ...item,
            completed: (count || 0) > 0
          };
        }
        if (item.id === "publish_store") {
          return {
            ...item,
            completed: store?.is_published || false
          };
        }
        return item;
      }));
    } catch (error) {
      console.error("Error checking progress:", error);
    }
  };
  const completedCount = items.filter(item => item.completed).length;
  const progress = Math.round(completedCount / items.length * 100);
  const handleDismiss = () => {
    localStorage.setItem("onboarding_dismissed", "true");
    setIsDismissed(true);
  };
  if (isDismissed || progress === 100) {
    return null;
  }
  return <Card className="mb-6 overflow-hidden border-2 border-primary/20">
      <div className="p-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Começar </h3>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{items.length} completo
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{
              width: `${progress}%`
            }} />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isCollapsed && <div className="p-4 space-y-3">
          {items.map(item => <Link key={item.id} to={item.link} className="block">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">
                  {item.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Link>)}
        </div>}
    </Card>;
};