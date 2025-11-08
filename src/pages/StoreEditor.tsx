import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, RotateCcw, Maximize2 } from "lucide-react";
import { templates } from "@/config/templates";
import { hslToHex, hexToHsl } from "@/lib/colorUtils";
import { StorePreviewModal } from "@/components/StorePreviewModal";

const StoreEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [template, setTemplate] = useState("minimog");
  const [customColors, setCustomColors] = useState({
    primary: templates.minimog.colors.primary,
    secondary: templates.minimog.colors.secondary,
    accent: templates.minimog.colors.accent,
    background: templates.minimog.colors.background,
    muted: templates.minimog.colors.muted,
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        setTemplate(data.template);
        
        // Load custom configuration if exists
        if (data.template_config && typeof data.template_config === 'object') {
          const config = data.template_config as any;
          if (config.colors) {
            setCustomColors({
              ...config.colors,
              background: config.colors.background || templates.minimog.colors.background,
              muted: config.colors.muted || templates.minimog.colors.muted,
            });
          }
        } else {
          // Use default template colors
          const defaultTemplate = templates[data.template as keyof typeof templates] || templates.minimog;
          setCustomColors(defaultTemplate.colors);
        }
      }
    } catch (error: any) {
      console.error("Error loading store:", error);
    } finally {
      setLoading(false);
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
        return;
      }

      const currentTemplate = templates[template as keyof typeof templates] || templates.minimog;
      const templateConfig = {
        ...currentTemplate,
        colors: customColors,
      };

      if (store) {
        const { error } = await supabase
          .from("stores")
          .update({
            name: storeName,
            subdomain: cleanSubdomain,
            template,
            template_config: templateConfig,
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
            template,
            template_config: templateConfig,
            plan: "free",
          });

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Erro",
              description: "Este subdomínio já está em uso. Escolhe outro.",
              variant: "destructive",
            });
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

  const resetToDefaults = () => {
    const defaultTemplate = templates[template as keyof typeof templates] || templates.minimog;
    setCustomColors(defaultTemplate.colors);
    toast({
      title: "Restaurado",
      description: "Configurações restauradas para o padrão do template.",
    });
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    const defaultTemplate = templates[newTemplate as keyof typeof templates] || templates.minimog;
    setCustomColors(defaultTemplate.colors);
  };

  const previewConfig = {
    ...templates[template as keyof typeof templates] || templates.minimog,
    colors: customColors,
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

      {/* Main Content */}
      <div className="max-w-4xl">

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
                    onChange={(e) => setStoreName(e.target.value)}
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">.myndlink.com</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Apenas letras minúsculas, números e hífens
                  </p>
                </div>
              </div>
            </Card>

            {/* Template Selection */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Escolher Template</h2>
              <div>
                <Label htmlFor="template">Template Base</Label>
                <Select value={template} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Escolher template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prestige">🏆 Prestige (Luxo)</SelectItem>
                    <SelectItem value="empire">👑 Empire (Editorial)</SelectItem>
                    <SelectItem value="atelier">🎨 Atelier (Sofisticado)</SelectItem>
                    <SelectItem value="dawn">☀️ Dawn (Moderno)</SelectItem>
                    <SelectItem value="minimal">⚪ Minimal (Minimalista)</SelectItem>
                    <SelectItem value="impulse">💃 Impulse (Fashion)</SelectItem>
                    <SelectItem value="vogue">📰 Vogue (Editorial)</SelectItem>
                    <SelectItem value="vertex">⚡ Vertex (Tech)</SelectItem>
                    <SelectItem value="fashion">Moda (Clássico)</SelectItem>
                    <SelectItem value="electronics">Eletrônicos (Clássico)</SelectItem>
                    <SelectItem value="beauty">Beleza (Clássico)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Escolhe um template base e personaliza as cores e layout abaixo
                </p>
              </div>
            </Card>

            {/* Customization Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Personalizar Template</h2>
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar Padrão
                </Button>
              </div>

              {/* Color Pickers */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg">Cores</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary-color"
                        type="color"
                        value={hslToHex(customColors.primary)}
                        onChange={(e) =>
                          setCustomColors({ ...customColors, primary: hexToHsl(e.target.value) })
                        }
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={hslToHex(customColors.primary)}
                        readOnly
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Cor Secundária (Fundo)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={hslToHex(customColors.secondary)}
                        onChange={(e) =>
                          setCustomColors({ ...customColors, secondary: hexToHsl(e.target.value) })
                        }
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={hslToHex(customColors.secondary)}
                        readOnly
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color">Cor de Destaque</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="accent-color"
                        type="color"
                        value={hslToHex(customColors.accent)}
                        onChange={(e) =>
                          setCustomColors({ ...customColors, accent: hexToHsl(e.target.value) })
                        }
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={hslToHex(customColors.accent)}
                        readOnly
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
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

            {/* Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Pré-visualização</h2>
                <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(true)}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Tela Cheia
                </Button>
              </div>
              <div className="border border-border rounded-lg p-6">
                <div 
                  className="rounded-lg overflow-hidden border-2 border-border"
                  style={{
                    backgroundColor: `hsl(${previewConfig.colors.secondary})`
                  }}
                >
                  <div className="p-8">
                    <h3 
                      className={`text-2xl mb-6 ${previewConfig.fonts.heading}`}
                      style={{ color: `hsl(${previewConfig.colors.primary})` }}
                    >
                      {storeName || "Minha Loja"}
                    </h3>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
                          <div 
                            className="aspect-square"
                            style={{ backgroundColor: `hsl(${previewConfig.colors.accent})` }}
                          />
                          <div className={`p-4 ${previewConfig.fonts.body}`}>
                            <p className="font-bold mb-1">Produto {i}</p>
                            <p className="text-sm opacity-70 mb-2">Descrição do produto</p>
                            <p className="font-bold" style={{ color: `hsl(${previewConfig.colors.primary})` }}>
                              99.99 MT
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
      </div>

      <StorePreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        storeName={storeName}
        currentConfig={previewConfig}
      />
    </>
  );
};

export default StoreEditor;
