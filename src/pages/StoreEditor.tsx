import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Save, Eye } from "lucide-react";
import { templates } from "@/config/templates";
import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { EditorSidebar } from "@/components/store-editor/EditorSidebar";
import { ConfigPanel } from "@/components/store-editor/ConfigPanel";
import { PreviewToolbar } from "@/components/store-editor/PreviewToolbar";
import { toast } from "sonner";

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
      announcement: "Frete grátis em compras acima de 500 MT",
    },
    hero: {
      showHero: true,
      title: "",
      subtitle: "",
      backgroundImage: "",
    },
    categories: [],
    branding: {
      logo: "",
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      {/* Top Bar Fixo */}
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Editor da Loja</h1>
          <span className="text-sm text-muted-foreground">
            {storeName || "Sem nome"}
          </span>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              • Guardado agora mesmo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {store && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (store?.subdomain) {
                  window.open(`/store/${store.subdomain}`, "_blank");
                }
              }}
              disabled={!store?.subdomain}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Loja
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

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
        <div className="flex-1 flex flex-col">
          <PreviewToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
          <div className="flex-1 overflow-hidden">
            <StorefrontPreview
              config={config}
              storeName={storeName || "Minha Loja"}
              storeId={store?.id}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreEditor;
