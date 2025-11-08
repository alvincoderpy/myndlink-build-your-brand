import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Save, ExternalLink, ArrowLeft } from "lucide-react";
import { templates } from "@/config/templates";
import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { EditorSidebar } from "@/components/store-editor/EditorSidebar";
import { ConfigPanel } from "@/components/store-editor/ConfigPanel";
import { PreviewToolbar } from "@/components/store-editor/PreviewToolbar";
import { toast } from "sonner";
import { motion } from "framer-motion";

const StoreEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [config, setConfig] = useState<any>({
    ...templates.minimog,
    topBar: {
      showAnnouncement: true,
      announcement: "🎉 Frete grátis em compras acima de 500 MT | Entrega em 24h",
      showSocial: true,
    },
    hero: {
      showHero: true,
      title: "Descobre a Moda que Define o Teu Estilo",
      subtitle: "Produtos exclusivos com qualidade premium e entrega rápida",
      backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      ctaText: "Ver Coleção",
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
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop",
    },
  });
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState("branding");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auto-save with debounce
  const debouncedConfig = useDebounce(config, 2000);
  
  useEffect(() => {
    if (store && !loading) {
      handleAutoSave();
    }
  }, [debouncedConfig]);

  useEffect(() => {
    loadStore();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [storeName, subdomain, config, store]);

  const loadStore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setStore(data);
        setStoreName(data.name);
        setSubdomain(data.subdomain);
        
        // Load custom configuration if exists
        if (data.template_config && typeof data.template_config === 'object') {
          const loadedConfig = data.template_config as any;
          setConfig({
            ...templates.minimog,
            ...loadedConfig,
            topBar: loadedConfig.topBar || config.topBar,
            hero: loadedConfig.hero || config.hero,
            categories: loadedConfig.categories || [],
            branding: loadedConfig.branding || { logo: "" },
          });
        }
      }
    } catch (error: any) {
      console.error("Error loading store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!store) return;
    
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: storeName,
          template_config: config,
        })
        .eq("id", store.id);

      if (error) throw error;
      setLastSaved(new Date());
    } catch (error: any) {
      console.error("Auto-save error:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      
      if (!cleanSubdomain || cleanSubdomain.length < 3) {
        toast.error("Subdomínio deve ter pelo menos 3 caracteres");
        setSaving(false);
        return;
      }

      if (store) {
        const { error } = await supabase
          .from("stores")
          .update({
            name: storeName,
            subdomain: cleanSubdomain,
            template: "minimog",
            template_config: config,
          })
          .eq("id", store.id);

        if (error) throw error;

        toast.success("Loja atualizada!", {
          description: "As tuas alterações foram guardadas.",
        });
      } else {
        const { error } = await supabase
          .from("stores")
          .insert({
            user_id: user.id,
            name: storeName,
            subdomain: cleanSubdomain,
            template: "minimog",
            template_config: config,
            plan: "free",
          });

        if (error) {
          if (error.code === "23505") {
            toast.error("Este subdomínio já está em uso. Escolhe outro.");
            setSaving(false);
            return;
          }
          throw error;
        }

        toast.success("Loja criada!", {
          description: "A tua loja foi criada com sucesso.",
        });
      }

      await loadStore();
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao guardar a loja.");
    } finally {
      setSaving(false);
    }
  };


  return loading ? (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        animate={{ 
          rotate: 360,
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: 1, ease: "linear" },
          opacity: { repeat: Infinity, duration: 1.5 }
        }}
        className="h-12 w-12 border-b-2 border-primary rounded-full"
      />
    </div>
  ) : (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/store")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="border-l pl-4">
            <h1 className="text-xl font-bold">{storeName || "Editor da Loja"}</h1>
            <p className="text-sm text-muted-foreground">
              {subdomain ? `${subdomain}.myndlink.com` : "Configure sua loja"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground flex items-center gap-1"
            >
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Guardado agora
            </motion.span>
          )}

          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>

          {subdomain && (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(`/storefront/${subdomain}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Loja
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Content - 3 Colunas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Coluna 1: Sidebar de Seções */}
        <EditorSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Coluna 2: Painel de Configuração */}
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

        {/* Coluna 3: Preview */}
        <div className="flex-1 flex flex-col border-l bg-muted/20">
          <PreviewToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
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
      </div>
    </div>
  );
};

export default StoreEditor;
