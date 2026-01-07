import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { hslToHex, hexToHsl } from "@/lib/colorUtils";

interface BrandingConfigProps {
  config: any;
  onChange: (config: any) => void;
  storeId?: string;
}

export function BrandingConfig({ config, onChange, storeId }: BrandingConfigProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const brandingConfig = config.branding || {};

  const updateBranding = (updates: any) => {
    onChange({
      ...config,
      branding: {
        ...brandingConfig,
        ...updates,
      },
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !storeId) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${storeId}/logo-${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from("store-assets")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("store-assets")
        .getPublicUrl(fileName);

      updateBranding({ logo: urlData.publicUrl });
      
      toast({
        title: "Logo carregado!",
        description: "O logo da loja foi atualizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Logo da Loja</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Faça upload do logo que aparecerá no cabeçalho
        </p>
        
        {brandingConfig.logo && (
          <div className="relative w-48 h-24 rounded-lg overflow-hidden border mb-4 bg-background flex items-center justify-center">
            <img
              src={brandingConfig.logo}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={uploading || !storeId}
          onClick={() => document.getElementById("logo-upload")?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Carregando..." : "Carregar Logo"}
        </Button>
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">Cores da Marca</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="primary-color"
                type="color"
                value={hslToHex(config.colors.primary)}
                onChange={(e) =>
                  onChange({ ...config, colors: { ...config.colors, primary: hexToHsl(e.target.value) } })
                }
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={hslToHex(config.colors.primary)}
                readOnly
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary-color">Cor de Fundo</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="secondary-color"
                type="color"
                value={hslToHex(config.colors.secondary)}
                onChange={(e) =>
                  onChange({ ...config, colors: { ...config.colors, secondary: hexToHsl(e.target.value) } })
                }
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={hslToHex(config.colors.secondary)}
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
                value={hslToHex(config.colors.accent)}
                onChange={(e) =>
                  onChange({ ...config, colors: { ...config.colors, accent: hexToHsl(e.target.value) } })
                }
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={hslToHex(config.colors.accent)}
                readOnly
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
