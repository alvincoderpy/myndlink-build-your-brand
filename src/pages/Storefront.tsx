import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { templates } from "@/config/templates";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  is_active: boolean;
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
      .select("*, template_config")
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
    toast.success("Produto adicionado ao carrinho");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
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
    toast.success("Produto removido do carrinho");
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  const baseTemplate = templates[store?.template as keyof typeof templates] || templates.fashion;
  
  const templateConfig = store?.template_config && typeof store.template_config === 'object'
    ? { ...baseTemplate, ...(store.template_config as any) } 
    : baseTemplate;

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: `hsl(${templateConfig.colors.secondary})` }}
    >
      {/* Header */}
      <header 
        className="border-b sticky top-0 z-40"
        style={{ 
          backgroundColor: `hsl(${templateConfig.colors.secondary})`,
          borderColor: `hsl(${templateConfig.colors.accent})`
        }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 
            className={`text-2xl font-bold ${templateConfig.fonts.heading}`}
            style={{ color: `hsl(${templateConfig.colors.primary})` }}
          >
            {store.name}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCart(!showCart)}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Carrinho
            {cart.length > 0 && (
              <Badge className="ml-2 absolute -top-2 -right-2">
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-8 ${templateConfig.fonts.body}`}>
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Sem produtos disponíveis</h2>
              <p className="text-muted-foreground">Esta loja ainda não tem produtos</p>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className={`grid gap-6 ${
              templateConfig.layout === 'list' 
                ? 'grid-cols-1' 
                : templateConfig.layout === 'masonry'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`overflow-hidden group h-full ${
                  templateConfig.cardStyle === 'elegant' ? 'shadow-sm hover:shadow-xl' :
                  templateConfig.cardStyle === 'modern' ? 'border-2 hover:border-primary' :
                  'rounded-2xl hover:shadow-lg'
                }`}>
                  <div className={`${
                    templateConfig.layout === 'masonry' 
                      ? (index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[5/4]')
                      : templateConfig.layout === 'list'
                      ? 'aspect-video'
                      : 'aspect-square'
                  } bg-muted relative overflow-hidden`}>
                    {product.image_url ? (
                      <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{product.price.toFixed(2)} MT</p>
                      <Button size="sm" onClick={() => addToCart(product)}>
                        Adicionar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {product.stock} em estoque
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Carrinho</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCart(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carrinho vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              Sem imagem
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{item.name}</h3>
                          <p className="text-lg font-bold mb-2">
                            {item.price.toFixed(2)} MT
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total:</span>
                    <span>{getTotalPrice().toFixed(2)} MT</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </Button>
              </>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
