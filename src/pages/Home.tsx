import { ActionCard } from "@/components/app/ActionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/contexts/useStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Package, Palette, Pencil, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStore, refreshStores } = useStore();
  const { toast } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [storeName, setStoreName] = useState(currentStore?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStoreName(currentStore?.name ?? "");
    setIsEditingName(false);
  }, [currentStore?.id, currentStore?.name]);

  const handleSaveName = async () => {
    if (!currentStore || !storeName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ name: storeName.trim() })
        .eq("id", currentStore.id);

      if (error) throw error;

      await refreshStores();
      setIsEditingName(false);
      toast({
        title: t("home.nameSaved"),
        description: t("home.nameSavedDesc"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("home.saveError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Início</h1>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-10 w-72 text-sm font-medium"
              autoFocus
            />
            <Button onClick={handleSaveName} disabled={isSaving}>
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditingName(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        ) : !currentStore?.name ? (
          <Button
            variant="outline"
            size="sm"
            disabled={!currentStore}
            className="gap-2"
            onClick={() => {
              setStoreName("");
              setIsEditingName(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Definir nome da loja
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        <ActionCard
          icon={<Globe className="h-4 w-4" />}
          title="Domínio"
          description="Conecte ou personalize o seu domínio."
          href="/dashboard/settings"
          primaryAction={{
            label: "Configurar domínio",
            onClick: () => navigate("/dashboard/settings"),
          }}
        />

        <ActionCard
          icon={<Package className="h-4 w-4" />}
          title="Adicionar produtos"
          description="Crie e gerencie o seu catálogo de produtos."
          href="/dashboard/products"
          primaryAction={{
            label: "Abrir produtos",
            onClick: () => navigate("/dashboard/products"),
          }}
        />

        <ActionCard
          icon={<Palette className="h-4 w-4" />}
          title="Personalizar loja"
          description="Ajuste tema, branding e configurações da loja."
          href="/dashboard/store/edit"
          primaryAction={{
            label: "Personalizar",
            onClick: () => navigate("/dashboard/store/edit"),
          }}
        />

        <ActionCard
          icon={<ShoppingCart className="h-4 w-4" />}
          title="Pedidos"
          description="Acompanhe e processe pedidos dos seus clientes."
          href="/dashboard/orders"
          primaryAction={{
            label: "Ver pedidos",
            onClick: () => navigate("/dashboard/orders"),
          }}
        />
      </div>
    </div>
  );
}



