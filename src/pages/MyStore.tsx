import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { Store, Edit, ExternalLink, Package, ShoppingCart, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
export default function MyStore() {
  const {
    user
  } = useAuth();
  const {
    currentStore,
    refreshStores
  } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0
  });
  useEffect(() => {
    loadStoreData();
  }, [currentStore]);
  const loadStoreData = async () => {
    if (!currentStore) {
      setLoading(false);
      return;
    }
    try {
      const [productsRes, ordersRes] = await Promise.all([supabase.from("products").select("id", {
        count: "exact"
      }).eq("store_id", currentStore.id), supabase.from("orders").select("id", {
        count: "exact"
      }).eq("store_id", currentStore.id)]);
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
      await supabase.from("stores").update({
        is_published: newStatus
      }).eq("id", currentStore.id);
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
    return <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-muted rounded-lg"></div>
      <div className="h-64 bg-muted rounded-lg"></div>
    </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minha Loja</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza e edita a tua loja online
          </p>
        </div>
        
        <div className="hidden md:flex">
          <Button onClick={() => navigate("/dashboard/store/edit")} size="lg">
            <Edit className="w-4 h-4 mr-2" />
            Editar Loja
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              {currentStore?.template_config?.branding?.logo ? <img src={currentStore.template_config.branding.logo} alt={currentStore.name} className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-primary" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {currentStore?.name || "Sem nome"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                
                {currentStore?.subdomain && <span className="text-sm text-muted-foreground">
                    {currentStore.subdomain}.myndlink.com
                  </span>}
              </div>
            </div>
          </div>

          
        </div>

        {/* Link da loja publicada */}
        {currentStore?.is_published && storeUrl && <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Link da loja:</span>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-mono">
                {storeUrl}
              </a>
              <Button variant="ghost" size="sm" onClick={copyStoreLink}>
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
          </div>}
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos</p>
              <p className="text-3xl font-bold mt-1">{stats.products}</p>
            </div>
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => navigate("/dashboard/products")}>Gerir produtos</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pedidos</p>
              <p className="text-3xl font-bold mt-1">{stats.orders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => navigate("/dashboard/orders")}>Ver pedidos</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="text-xl font-bold mt-1 capitalize">
                {currentStore?.plan || "Free"}
              </p>
            </div>
          </div>
          <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => navigate("/pricing")}>Melhorar plano</Button>
        </Card>
      </div>

      {/* Preview Básico */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Preview da Loja</h3>
          {storeUrl && <Button variant="outline" size="sm" onClick={() => window.open(storeUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir loja
            </Button>}
        </div>

        {currentStore?.is_published ? <div className="aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
            <iframe src={storeUrl || ""} className="w-full h-full" title="Preview da loja" />
          </div> : <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Publica a loja para ver o preview
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handlePublishToggle}>
                Publicar agora
              </Button>
            </div>
          </div>}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Ações Rápidas</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="justify-start h-auto py-4" onClick={() => navigate("/dashboard/store/edit")}>
            <Edit className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Editar Design</div>
              <div className="text-xs text-muted-foreground">
                Cores, logo, hero, categorias
              </div>
            </div>
          </Button>

          <Button variant="outline" className="justify-start h-auto py-4" onClick={() => navigate("/dashboard/products")}>
            <Package className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Adicionar Produtos</div>
              <div className="text-xs text-muted-foreground">
                Expande o teu catálogo
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>;
}