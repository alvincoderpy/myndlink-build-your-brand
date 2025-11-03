import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, RotateCcw } from "lucide-react";
import { templates } from "@/config/templates";
import { hslToHex, hexToHsl } from "@/lib/colorUtils";

const StoreEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [template, setTemplate] = useState("fashion");
  const [customColors, setCustomColors] = useState({
    primary: templates.fashion.colors.primary,
    secondary: templates.fashion.colors.secondary,
    accent: templates.fashion.colors.accent,
  });
  const [customLayout, setCustomLayout] = useState<"grid" | "list" | "masonry">("grid");
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
            setCustomColors(config.colors);
          }
          if (config.layout) {
            setCustomLayout(config.layout);
          }
        } else {
          // Use default template colors and layout
          const defaultTemplate = templates[data.template as keyof typeof templates];
          setCustomColors(defaultTemplate.colors);
          setCustomLayout(defaultTemplate.layout);
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

      const templateConfig = {
        base: template,
        colors: customColors,
        layout: customLayout,
        fonts: templates[template as keyof typeof templates].fonts,
        cardStyle: templates[template as keyof typeof templates].cardStyle,
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
    const defaultTemplate = templates[template as keyof typeof templates];
    setCustomColors(defaultTemplate.colors);
    setCustomLayout(defaultTemplate.layout);
    toast({
      title: "Restaurado",
      description: "Configurações restauradas para o padrão do template.",
    });
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    const defaultTemplate = templates[newTemplate as keyof typeof templates];
    setCustomColors(defaultTemplate.colors);
    setCustomLayout(defaultTemplate.layout);
  };

  const previewConfig = {
    ...templates[template as keyof typeof templates],
    colors: customColors,
    layout: customLayout,
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
              onClick={() => window.open(`/store/${subdomain}`, '_blank')}
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
                    <SelectItem value="fashion">Moda</SelectItem>
                    <SelectItem value="electronics">Eletrônicos</SelectItem>
                    <SelectItem value="beauty">Beleza</SelectItem>
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

              {/* Layout Selection */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Layout dos Produtos</h3>
                <RadioGroup value={customLayout} onValueChange={(value: any) => setCustomLayout(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="grid" id="layout-grid" />
                      <Label htmlFor="layout-grid" className="font-normal cursor-pointer">
                        Grade (3-4 colunas) - Layout tradicional em grade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="list" id="layout-list" />
                      <Label htmlFor="layout-list" className="font-normal cursor-pointer">
                        Lista (1 coluna) - Produtos em lista vertical
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masonry" id="layout-masonry" />
                      <Label htmlFor="layout-masonry" className="font-normal cursor-pointer">
                        Mosaico (tamanhos variados) - Layout dinâmico tipo Pinterest
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Pré-visualização</h2>
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
                    <div 
                      className={`grid gap-4 ${
                        previewConfig.layout === 'list' 
                          ? 'grid-cols-1' 
                          : previewConfig.layout === 'masonry'
                          ? 'grid-cols-2'
                          : 'grid-cols-2 md:grid-cols-3'
                      }`}
                    >
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
                          <div 
                            className={`${previewConfig.layout === 'list' ? 'aspect-video' : 'aspect-square'}`}
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
    </>
  );
};

export default StoreEditor;
