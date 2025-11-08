import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { templates } from "@/config/templates";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TopBar } from "@/components/storefront/TopBar";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { HeroSection } from "@/components/storefront/HeroSection";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartSidebar } from "@/components/storefront/CartSidebar";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  discount_percentage: number;
  is_new: boolean;
  is_featured: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Storefront() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadStore();
  }, [subdomain]);

  const loadStore = async () => {
    setLoading(true);
    const { data: storeData } = await supabase
      .from("stores")
      .select("*")
      .eq("subdomain", subdomain)
      .eq("is_published", true)
      .single();

    if (!storeData) {
      toast.error("Loja não encontrada");
      setLoading(false);
      return;
    }

    setStore(storeData);

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeData.id)
      .eq("is_active", true)
      .gt("stock", 0);

    setProducts(productsData || []);
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Quantidade máxima atingida");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
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
              toast.error("Quantidade máxima atingida");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
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
          <h1 className="text-2xl font-bold mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground">Esta loja não existe ou não está publicada</p>
        </Card>
      </div>
    );
  }

  const config = store?.template_config || templates.minimog;
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      {config.topBar?.enabled && (
        <TopBar config={config.topBar} />
      )}
      
      {/* Header */}
      <StorefrontHeader
        storeName={store?.name || ""}
        logoUrl={store?.logo_url}
        cartCount={cart.length}
        onCartClick={() => setShowCart(true)}
      />
      
      {/* Hero Section */}
      {config.hero?.enabled && (
        <HeroSection 
          config={config.hero}
          featuredProducts={featuredProducts}
        />
      )}
      
      {/* Category Grid */}
      {config.categories?.enabled && (
        <CategoryGrid config={config.categories} />
      )}
      
      {/* Product Tabs */}
      {config.productTabs?.enabled && (
        <ProductTabs 
          config={config.productTabs}
          products={products}
          onAddToCart={addToCart}
        />
      )}
      
      {/* Footer */}
      <StorefrontFooter 
        storeName={store?.name}
        socialLinks={store?.social_links}
      />
      
      {/* Cart Sidebar */}
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
