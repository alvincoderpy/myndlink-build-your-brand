import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandingConfig } from "./BrandingConfig";
import { TopBarConfig } from "./TopBarConfig";
import { HeroConfig } from "./HeroConfig";
import { CategoriesConfig } from "./CategoriesConfig";

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
    if (!storeId) {
      toast.error("Por favor, guarde a loja primeiro");
      return;
    }

    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_published: checked })
        .eq("id", storeId);

      if (error) throw error;

      toast.success(
        checked ? "Loja publicada com sucesso!" : "Loja despublicada"
      );
      onStoreUpdate();
    } catch (error: any) {
      console.error("Error toggling publish:", error);
      toast.error("Erro ao atualizar estado de publicação");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {activeSection === "branding" && (
            <div>
              <h3 className="font-semibold mb-4">Marca</h3>
              <BrandingConfig 
                config={config} 
                onChange={onChange} 
                storeId={storeId} 
              />
            </div>
          )}
          
          {activeSection === "topbar" && (
            <div>
              <h3 className="font-semibold mb-4">Barra Superior</h3>
              <TopBarConfig config={config} onChange={onChange} />
            </div>
          )}
          
          {activeSection === "hero" && (
            <div>
              <h3 className="font-semibold mb-4">Banner Principal</h3>
              <HeroConfig config={config} onChange={onChange} storeId={storeId} />
            </div>
          )}
          
          {activeSection === "categories" && (
            <div>
              <h3 className="font-semibold mb-4">Categorias</h3>
              <CategoriesConfig 
                config={config} 
                onChange={onChange} 
                storeId={storeId} 
              />
            </div>
          )}
          
          {activeSection === "settings" && (
            <div className="space-y-6">
              <h3 className="font-semibold mb-4">Configurações</h3>
              
              <div>
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => onStoreNameChange(e.target.value)}
                  placeholder="Minha Loja"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomínio</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) =>
                      onSubdomainChange(e.target.value.toLowerCase())
                    }
                    placeholder="minhaloja"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    .myndlink.com
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              {storeId && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label className="text-base font-semibold">
                      Publicar Loja
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Torna a loja visível publicamente
                    </p>
                  </div>
                  <Switch
                    checked={store?.is_published || false}
                    onCheckedChange={handlePublishToggle}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
