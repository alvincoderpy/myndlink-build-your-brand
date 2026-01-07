import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface HeroConfigProps {
  config: any;
  onChange: (config: any) => void;
  storeId?: string;
}

export function HeroConfig({ config, onChange, storeId }: HeroConfigProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const heroConfig = config.hero || {};

  const updateHero = (updates: any) => {
    onChange({
      ...config,
      hero: {
        ...heroConfig,
        ...updates,
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !storeId) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${storeId}/hero-${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from("store-assets")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("store-assets")
        .getPublicUrl(fileName);

      updateHero({ backgroundImage: urlData.publicUrl });
      
      toast({
        title: "Imagem carregada!",
        description: "A imagem do hero foi atualizada.",
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
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Mostrar Seção Hero</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Exibe uma grande seção de destaque no topo
          </p>
        </div>
        <Switch
          checked={heroConfig.showHero !== false}
          onCheckedChange={(checked) => updateHero({ showHero: checked })}
        />
      </div>

      {heroConfig.showHero !== false && (
        <>
          <div>
            <Label htmlFor="hero-title">Título do Hero</Label>
            <Input
              id="hero-title"
              placeholder="Bem-vindo a nossa loja"
              value={heroConfig.title || ""}
              onChange={(e) => updateHero({ title: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="hero-subtitle">Subtítulo</Label>
            <Input
              id="hero-subtitle"
              placeholder="Descubra produtos incríveis"
              value={heroConfig.subtitle || ""}
              onChange={(e) => updateHero({ subtitle: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Imagem de Fundo</Label>
            <div className="mt-2 space-y-2">
              {heroConfig.backgroundImage && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img
                    src={heroConfig.backgroundImage}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading || !storeId}
                onClick={() => document.getElementById("hero-image-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Carregando..." : "Carregar Imagem"}
              </Button>
              <input
                id="hero-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hero-overlay">Cor de Sobreposição</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="hero-overlay"
                type="color"
                value={heroConfig.overlayColor || "#000000"}
                onChange={(e) => updateHero({ overlayColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={heroConfig.overlayColor || "#000000"}
                onChange={(e) => updateHero({ overlayColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cor escura sobre a imagem de fundo
            </p>
          </div>

          <div>
            <Label htmlFor="hero-title-color">Cor do Título</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="hero-title-color"
                type="color"
                value={heroConfig.titleColor || "#ffffff"}
                onChange={(e) => updateHero({ titleColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={heroConfig.titleColor || "#ffffff"}
                onChange={(e) => updateHero({ titleColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hero-button-color">Cor do Botão</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="hero-button-color"
                type="color"
                value={heroConfig.buttonColor || "#ffffff"}
                onChange={(e) => updateHero({ buttonColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={heroConfig.buttonColor || "#ffffff"}
                onChange={(e) => updateHero({ buttonColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
