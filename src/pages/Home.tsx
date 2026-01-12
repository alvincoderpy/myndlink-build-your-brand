import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, Palette, CreditCard, Truck, Globe, Pencil, Upload, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStore, refreshStores } = useStore();
  const { toast } = useToast();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [storeName, setStoreName] = useState(currentStore?.name || "");
  const [storeDescription, setStoreDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const storeUrl = currentStore?.subdomain 
    ? `${currentStore.subdomain}.myndlink.com` 
    : "minhaloja.myndlink.com";

  return (
    <div className="space-y-6">
      {/* Store Name Header */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="text-2xl font-semibold h-12 w-80"
              autoFocus
            />
            <Button onClick={handleSaveName} disabled={isSaving}>
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditingName(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        ) : (
          <button
            onClick={() => {
              setStoreName(currentStore?.name || "");
              setIsEditingName(true);
            }}
            className="flex items-center gap-2 group"
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              {currentStore?.name || t("home.addStoreName")}
            </h1>
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Main Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Add First Product */}
        <Card className="md:row-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{t("home.addFirstProduct")}</CardTitle>
                <CardDescription className="mt-1">
                  {t("home.addFirstProductDesc")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => navigate("/dashboard/products")} className="flex-1">
              {t("home.addProduct")}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t("home.import")}
            </Button>
          </CardContent>
        </Card>

        {/* Design Store */}
        <Card className="md:row-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-accent p-3">
                <Palette className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{t("home.designStore")}</CardTitle>
                <CardDescription className="mt-1">
                  {t("home.designStoreDesc")}{" "}
                  <button 
                    onClick={() => navigate("/dashboard/store/edit")}
                    className="text-primary hover:underline"
                  >
                    {t("home.browseThemes")}
                  </button>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder={t("home.descriptionPlaceholder")}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate("/dashboard/store/edit")}
              >
                <Sparkles className="h-4 w-4" />
                {t("home.generate")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Setup Payments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{t("home.setupPayments")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>M-Pesa</span>
                <span>•</span>
                <span>e-Mola</span>
                <span>•</span>
                <span>Cash</span>
              </div>
              <Button size="sm" variant="outline">
                {t("home.activate")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Rates */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{t("home.reviewShipping")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {t("home.national")}
              </Badge>
              <Button size="sm" variant="outline">
                {t("home.review")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{t("home.customDomain")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {storeUrl}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate("/dashboard/settings")}
              >
                {t("home.customize")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
