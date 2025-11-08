import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CategoriesConfigProps {
  config: any;
  onChange: (config: any) => void;
  storeId?: string;
}

export function CategoriesConfig({ config, onChange, storeId }: CategoriesConfigProps) {
  const { toast } = useToast();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const categories = config.categories || [];

  const updateCategories = (newCategories: any[]) => {
    onChange({
      ...config,
      categories: newCategories,
    });
  };

  const addCategory = () => {
    updateCategories([
      ...categories,
      { name: "", slug: "", image: "" },
    ]);
  };

  const removeCategory = (index: number) => {
    updateCategories(categories.filter((_: any, i: number) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: value,
    };
    
    // Auto-generate slug from name
    if (field === "name") {
      newCategories[index].slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    updateCategories(newCategories);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !storeId) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${storeId}/category-${index}-${Date.now()}.${fileExt}`;

    setUploadingIndex(index);
    try {
      const { data, error } = await supabase.storage
        .from("store-assets")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("store-assets")
        .getPublicUrl(fileName);

      updateCategory(index, "image", urlData.publicUrl);
      
      toast({
        title: "Imagem carregada!",
        description: "A imagem da categoria foi atualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Categorias em Destaque</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Categorias que aparecerão na página inicial
          </p>
        </div>
        <Button type="button" size="sm" onClick={addCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category: any, index: number) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Categoria {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCategory(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Acessórios"
                value={category.name || ""}
                onChange={(e) => updateCategory(index, "name", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Slug (gerado automaticamente)</Label>
              <Input
                value={category.slug || ""}
                readOnly
                className="mt-1 bg-muted"
              />
            </div>

            <div>
              <Label>Imagem</Label>
              <div className="mt-2 space-y-2">
                {category.image && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={uploadingIndex === index || !storeId}
                  onClick={() => document.getElementById(`category-image-${index}`)?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingIndex === index ? "Carregando..." : "Carregar Imagem"}
                </Button>
                <input
                  id={`category-image-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(index, e)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
