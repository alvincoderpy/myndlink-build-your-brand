import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Save, Eye } from "lucide-react";
import { templates } from "@/config/templates";
import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { TopBarConfig } from "@/components/store-editor/TopBarConfig";
import { HeroConfig } from "@/components/store-editor/HeroConfig";
import { CategoriesConfig } from "@/components/store-editor/CategoriesConfig";
import { BrandingConfig } from "@/components/store-editor/BrandingConfig";

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
  const { toast } = useToast();
  
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
        toast({
          title: "Erro",
          description: "Subdomínio deve ter pelo menos 3 caracteres",
          variant: "destructive",
        });
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

        toast({
          title: "Loja atualizada!",
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
            toast({
              title: "Erro",
              description: "Este subdomínio já está em uso. Escolhe outro.",
              variant: "destructive",
            });
            setSaving(false);
            return;
          }
          throw error;
        }

        toast({
          title: "Loja criada!",
          description: "A tua loja foi criada com sucesso.",
        });
      }

      await loadStore();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao guardar a loja.",
        variant: "destructive",
      });
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
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {store ? "Minha Loja" : "Criar Loja"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {store ? "Personaliza a tua loja online" : "Configura a tua nova loja"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {store && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (store?.subdomain) {
                  window.open(`/store/${store.subdomain}`, '_blank');
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

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-8">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Loja</Label>
                <Input
                  id="name"
                  placeholder="Minha Loja Incrível"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (!config.hero?.title) {
                      setConfig({
                        ...config,
                        hero: {
                          ...config.hero,
                          title: `Bem-vindo a ${e.target.value}`,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomínio</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="subdomain"
                    placeholder="minhaloja"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">.myndlink.com</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>
            </div>
          </Card>

          {/* Configuration Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="branding">Marca</TabsTrigger>
                <TabsTrigger value="topbar">Top Bar</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="mt-6">
                <BrandingConfig
                  config={config}
                  onChange={setConfig}
                  storeId={store?.id}
                />
              </TabsContent>

              <TabsContent value="topbar" className="mt-6">
                <TopBarConfig
                  config={config}
                  onChange={setConfig}
                />
              </TabsContent>

              <TabsContent value="hero" className="mt-6">
                <HeroConfig
                  config={config}
                  onChange={setConfig}
                  storeId={store?.id}
                />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <CategoriesConfig
                  config={config}
                  onChange={setConfig}
                  storeId={store?.id}
                />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Publish Store */}
          {store && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Switch
                  checked={store?.is_published}
                  onCheckedChange={async (checked) => {
                    try {
                      const { error } = await supabase
                        .from('stores')
                        .update({ is_published: checked })
                        .eq('id', store.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: checked ? "Loja publicada!" : "Loja despublicada!",
                      });
                      await loadStore();
                    } catch (error: any) {
                      toast({
                        title: "Erro",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                />
                <div>
                  <Label className="text-base font-bold">Publicar Loja</Label>
                  <p className="text-sm text-muted-foreground">
                    Torna a tua loja visível ao público
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-6rem)]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Pré-visualização em Tempo Real</h2>
            <p className="text-sm text-muted-foreground mt-1">
              As alterações são guardadas automaticamente
            </p>
          </div>
          <div className="h-[calc(100%-4rem)] border border-border rounded-lg overflow-hidden">
            <StorefrontPreview
              config={config}
              storeName={storeName || "Minha Loja"}
              storeId={store?.id}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreEditor;
