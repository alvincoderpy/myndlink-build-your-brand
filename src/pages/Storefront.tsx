import { CartSidebar } from "@/components/storefront/CartSidebar";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { HeroSection } from "@/components/storefront/HeroSection";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { TopBar } from "@/components/storefront/TopBar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTemplateDefaults } from "@/config/templates";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/handleSupabaseError";
import type { CartItem, Product } from "@/types/product";
import type { PublicStore } from "@/types/store";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function Storefront() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const loadStore = useCallback(async () => {
    setLoading(true);

    const { data: storeData, error } = await supabase.rpc("get_public_store", {
      p_subdomain: subdomain || "",
    });

    if (error || !storeData || storeData.length === 0) {
      handleSupabaseError(
        error || new Error("Loja nao encontrada"),
        "Loja nao encontrada",
      );
      setLoading(false);
      return;
    }

    const storeRecord = storeData[0] as PublicStore;
    setStore(storeRecord);

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeRecord.id)
      .eq("is_active", true)
      .gt("stock", 0);

    const mappedProducts: Product[] = (productsData || []).map((p) => ({
      ...p,
      discount_percentage: p.discount_percentage || 0,
      is_new: p.is_new || false,
      is_featured: p.is_featured || false,
    }));

    setProducts(mappedProducts);
    setLoading(false);
  }, [subdomain]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Quantidade maxima atingida");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success("Adicionado ao carrinho");
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            if (newQuantity <= 0) return null;
            if (newQuantity > item.stock) {
              toast.error("Quantidade maxima atingida");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.success("Removido do carrinho");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    navigate(`/store/${subdomain}/checkout`, { state: { cart, store } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Loja nao encontrada</h1>
          <p className="text-muted-foreground">
            Esta loja nao existe ou nao esta publicada
          </p>
        </Card>
      </div>
    );
  }

  const config =
    store.template_config || getTemplateDefaults(store.template || "minimog");
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {config.topBar?.enabled && <TopBar config={config.topBar} />}

      <StorefrontHeader
        storeName={store.name || ""}
        logoUrl={store.logo_url}
        cartCount={cart.length}
        onCartClick={() => setShowCart(true)}
      />

      {config.hero?.enabled && (
        <HeroSection config={config.hero} featuredProducts={featuredProducts} />
      )}

      {config.categories?.enabled && <CategoryGrid config={config.categories} />}

      {config.productTabs?.enabled && (
        <ProductTabs
          config={config.productTabs}
          products={products}
          onAddToCart={addToCart}
        />
      )}

      <StorefrontFooter storeName={store.name} socialLinks={store.social_links} />

      <AnimatePresence>
        {showCart && (
          <CartSidebar
            cart={cart}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
