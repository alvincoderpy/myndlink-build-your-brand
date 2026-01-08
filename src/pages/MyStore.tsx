import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { Store, Edit, ExternalLink, Package, ShoppingCart, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export default function MyStore() {
  useAuth();
  const { currentStore, refreshStores } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    loadStoreData();
  }, [currentStore]);

  const loadStoreData = async () => {
    if (!currentStore) {
      setLoading(false);
      return;
    }
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }).eq("store_id", currentStore.id),
        supabase.from("orders").select("id", { count: "exact" }).eq("store_id", currentStore.id)
      ]);
      setStats({
        products: productsRes.count || 0,
        orders: ordersRes.count || 0
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!currentStore) return;
    try {
      const newStatus = !currentStore.is_published;
      await supabase.from("stores").update({ is_published: newStatus }).eq("id", currentStore.id);
      await refreshStores();
      if (newStatus) {
        const storeUrl = `https://${currentStore.subdomain}.myndlink.com`;
        toast.success("Loja publicada com sucesso!", {
          description: "A tua loja já está online!",
          action: {
            label: "Ver loja",
            onClick: () => window.open(storeUrl, "_blank")
          }
        });
      } else {
        toast.success("Loja despublicada");
      }
    } catch (error) {
      toast.error("Erro ao publicar loja");
    }
  };

  const copyStoreLink = () => {
    if (!currentStore) return;
    const storeUrl = `https://${currentStore.subdomain}.myndlink.com`;
    navigator.clipboard.writeText(storeUrl);
    toast.success("Link copiado!");
  };

  const storeUrl = currentStore?.subdomain ? `https://${currentStore.subdomain}.myndlink.com` : null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Minha Loja</h1>
          <p className="text-sm text-muted-foreground">Visualiza e edita a tua loja online</p>
        </div>
        <Button onClick={() => navigate("/dashboard/store/edit")}>
          <Edit className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Editar loja</span>
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentStore?.template_config?.branding?.logo ? (
                <img 
                  src={currentStore.template_config.branding.logo} 
                  alt={currentStore.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Store className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold">{currentStore?.name || "Sem nome"}</h2>
              {currentStore?.subdomain && (
                <p className="text-sm text-muted-foreground">{currentStore.subdomain}.myndlink.com</p>
              )}
            </div>
          </div>

          {currentStore?.is_published && storeUrl && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Link da loja:</span>
                <a 
                  href={storeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-primary hover:underline font-mono truncate"
                >
                  {storeUrl}
                </a>
                <Button variant="ghost" size="sm" className="h-7" onClick={copyStoreLink}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <Button 
              variant="link" 
              className="mt-1 p-0 h-auto text-xs" 
              onClick={() => navigate("/dashboard/products")}
            >
              Gerir produtos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <Button 
              variant="link" 
              className="mt-1 p-0 h-auto text-xs" 
              onClick={() => navigate("/dashboard/orders")}
            >
              Ver pedidos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Preview da Loja</CardTitle>
          {storeUrl && (
            <Button variant="outline" size="sm" onClick={() => window.open(storeUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir loja
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {currentStore?.is_published ? (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
              <iframe src={storeUrl || ""} className="w-full h-full" title="Preview da loja" />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Publica a loja para ver o preview</p>
                <Button onClick={handlePublishToggle}>Publicar agora</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
