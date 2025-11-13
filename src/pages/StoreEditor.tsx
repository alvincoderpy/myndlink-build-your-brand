import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, Monitor, Tablet, Smartphone, 
  Undo, Redo, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { templates } from "@/config/templates";
import { EditorSidebar } from "@/components/store-editor/EditorSidebar";
import { ConfigPanel } from "@/components/store-editor/ConfigPanel";
import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { useDebounce } from "@/hooks/useDebounce";
import { useHistory } from "@/hooks/useHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "desktop" | "tablet" | "mobile";

const StoreEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeSection, setActiveSection] = useState("branding");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { 
    state: config, 
    setState: setConfig, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<any>({
    ...templates.minimog,
    topBar: {
      showAnnouncement: true,
      announcement: "🎉 Frete grátis em compras acima de 500 MT | Entrega em 24h",
      showSocial: true,
      socialLinks: {
        instagram: "https://instagram.com/minhaloja",
        facebook: "https://facebook.com/minhaloja",
        whatsapp: "https://wa.me/258840000000",
      },
    },
    hero: {
      showHero: true,
      title: "Descobre a Moda que Define o Teu Estilo",
      subtitle: "Produtos exclusivos com qualidade premium e entrega rápida",
      backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      ctaText: "Ver Coleção",
      ctaLink: "#produtos",
      showPromo: true,
      promoText: "Entrega rápida • Pagamento seguro • Garantia de 30 dias",
    },
    categories: [
      {
        id: "cat1",
        name: "Roupas",
        slug: "roupas",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
        description: "Moda confortável e elegante",
      },
      {
        id: "cat2",
        name: "Calçados",
        slug: "calcados",
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
        description: "Ténis, botas e sandálias",
      },
      {
        id: "cat3",
        name: "Acessórios",
        slug: "acessorios",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        description: "Relógios, bolsas e óculos",
      },
      {
        id: "cat4",
        name: "Desporto",
        slug: "desporto",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        description: "Equipamento desportivo",
      },
    ],
    branding: {
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      accentColor: "#FFD700",
      fontFamily: "Inter",
    },
  });

  const debouncedConfig = useDebounce(config, 2000);

  useEffect(() => {
    loadStore();
  }, [user]);

  useEffect(() => {
    if (store?.id && debouncedConfig) {
      handleAutoSave();
    }
  }, [debouncedConfig]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo]);

  const loadStore = async () => {
    if (!user) return;

    try {
      const { data: stores, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (stores && stores.length > 0) {
        const currentStore = stores[0];
        setStore(currentStore);
        setStoreName(currentStore.name);
        setSubdomain(currentStore.subdomain);

        if (currentStore.template_config) {
          setConfig(currentStore.template_config);
        }
      }
    } catch (error: any) {
      console.error("Error loading store:", error);
      toast.error("Erro ao carregar loja");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!store?.id) return;

    try {
      await supabase
        .from("stores")
        .update({
          name: storeName,
          template_config: config,
        })
        .eq("id", store.id);

      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (store?.id) {
        const { error } = await supabase
          .from("stores")
          .update({
            name: storeName,
            subdomain: subdomain,
            template_config: config,
          })
          .eq("id", store.id);

        if (error) throw error;
        toast.success("Loja atualizada com sucesso!");
      } else {
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
        if (!subdomainRegex.test(subdomain)) {
          toast.error("Subdomínio inválido. Use apenas letras minúsculas, números e hífens.");
          return;
        }

        const { data: newStore, error } = await supabase
          .from("stores")
          .insert({
            user_id: user.id,
            name: storeName,
            subdomain: subdomain,
            template: "minimog",
            template_config: config,
          })
          .select()
          .single();

        if (error) throw error;
        setStore(newStore);

        // Insert mock products for new store
        if (newStore) {
          const template = templates[newStore.template as keyof typeof templates];
          if (template?.mockProducts) {
            const mockProductsToInsert = template.mockProducts.map((product, index) => ({
              store_id: newStore.id,
              ...product,
              is_mock: true,
              display_order: index + 1,
            }));

            const { error: productsError } = await supabase
              .from("products")
              .insert(mockProductsToInsert);

            if (productsError) {
              console.error("Erro ao inserir produtos mock:", productsError);
            }
          }
        }

        toast.success("Loja criada com produtos de exemplo!");
      }

      setLastSaved(new Date());
      await loadStore();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Erro ao guardar loja");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <div className="border-b bg-background px-4 py-2 flex items-center justify-between h-14 flex-shrink-0">
        {/* Left: Back + Section Selector */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard/store")}
            className="h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Voltar</span>
          </Button>
          
          {/* Mobile Section Selector */}
          <div className="lg:hidden">
            <Select value={activeSection} onValueChange={setActiveSection}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branding">Marca</SelectItem>
                <SelectItem value="topbar">Barra Superior</SelectItem>
                <SelectItem value="hero">Banner Principal</SelectItem>
                <SelectItem value="categories">Categorias</SelectItem>
                <SelectItem value="settings">Configurações</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: View Mode + Undo/Redo */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center gap-0.5 border rounded-md p-0.5">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "tablet" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 ml-2"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Desktop: Ver Loja / Mobile: Toggle Preview */}
        <div className="flex items-center gap-2">
          {/* Desktop: Ver Loja */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              if (store?.subdomain && store?.is_published) {
                window.open(`/storefront/${store.subdomain}`, "_blank");
              } else if (!store?.is_published) {
                toast.error("Publique a loja primeiro nas configurações");
              } else {
                toast.error("Configure um subdomínio primeiro");
              }
            }}
            disabled={!store?.subdomain}
            className="h-9 hidden md:flex"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Loja
          </Button>
          
          {/* Mobile: Toggle Preview */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="h-9 md:hidden"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Save Button */}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving} 
            className="h-9"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Main Layout: Sidebar Left | Preview Center | Config Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-60 border-r bg-background flex-shrink-0 hidden lg:block overflow-y-auto">
          <EditorSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>

        {/* Center - Preview */}
        <div 
          className={cn(
            "flex-1 flex flex-col bg-muted/20 overflow-hidden",
            showPreview ? "block" : "hidden md:flex"
          )}
        >
          <div className="flex-1 overflow-auto">
            <StorefrontPreview
              config={config}
              storeName={storeName || "Minha Loja"}
              storeId={store?.id}
              viewMode={viewMode}
              activeSection={activeSection}
            />
          </div>
        </div>

        {/* Right Panel - Configuration */}
        <div 
          className={cn(
            "w-full lg:w-80 border-l bg-background overflow-y-auto flex-shrink-0",
            showPreview ? "hidden md:block" : "block"
          )}
        >
          <ConfigPanel
            activeSection={activeSection}
            config={config}
            onChange={setConfig}
            storeId={store?.id}
            storeName={storeName}
            subdomain={subdomain}
            onStoreNameChange={setStoreName}
            onSubdomainChange={setSubdomain}
            store={store}
            onStoreUpdate={loadStore}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreEditor;
