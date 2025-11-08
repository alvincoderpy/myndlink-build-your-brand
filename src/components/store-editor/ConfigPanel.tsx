import { Card } from "@/components/ui/card";
import { BrandingConfig } from "./BrandingConfig";
import { TopBarConfig } from "./TopBarConfig";
import { HeroConfig } from "./HeroConfig";
import { CategoriesConfig } from "./CategoriesConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConfigPanelProps {
  activeSection: string;
  config: any;
  onChange: (config: any) => void;
  storeId?: string;
  storeName: string;
  subdomain: string;
  onStoreNameChange: (name: string) => void;
  onSubdomainChange: (subdomain: string) => void;
  store: any;
  onStoreUpdate: () => void;
}

export function ConfigPanel({
  activeSection,
  config,
  onChange,
  storeId,
  storeName,
  subdomain,
  onStoreNameChange,
  onSubdomainChange,
  store,
  onStoreUpdate,
}: ConfigPanelProps) {
  const handlePublishToggle = async (checked: boolean) => {
    if (!store) return;

    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_published: checked })
        .eq("id", store.id);

      if (error) throw error;

      if (checked) {
        const storeUrl = `https://${subdomain}.myndlink.com`;
        toast.success("Loja publicada com sucesso!", {
          description: "A tua loja já está online!",
          action: {
            label: "Ver loja",
            onClick: () => window.open(storeUrl, "_blank"),
          },
        });
      } else {
        toast.success("Loja despublicada");
      }

      onStoreUpdate();
    } catch (error: any) {
      toast.error("Erro ao publicar loja");
    }
  };

  return (
    <div className="w-96 border-r bg-background overflow-y-auto h-full">
      <div className="p-6">
        {activeSection === "branding" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Marca</h3>
            <BrandingConfig config={config} onChange={onChange} storeId={storeId} />
          </div>
        )}

        {activeSection === "topbar" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Barra Superior</h3>
            <TopBarConfig config={config} onChange={onChange} />
          </div>
        )}

        {activeSection === "hero" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Banner Principal</h3>
            <HeroConfig config={config} onChange={onChange} storeId={storeId} />
          </div>
        )}

        {activeSection === "categories" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorias</h3>
            <CategoriesConfig config={config} onChange={onChange} storeId={storeId} />
          </div>
        )}

        {activeSection === "settings" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Configurações da Loja</h3>
            </div>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Informações Básicas</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Loja</Label>
                  <Input
                    id="name"
                    placeholder="Minha Loja Incrível"
                    value={storeName}
                    onChange={(e) => onStoreNameChange(e.target.value)}
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
                      onChange={(e) => onSubdomainChange(e.target.value.toLowerCase())}
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

            {store && (
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Switch checked={store?.is_published} onCheckedChange={handlePublishToggle} />
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
        )}
      </div>
    </div>
  );
}
