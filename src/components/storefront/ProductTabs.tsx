import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount_percentage: number;
  is_new: boolean;
  is_featured: boolean;
  stock: number;
}

interface ProductTabsProps {
  config: {
    enabled: boolean;
    title: string;
    tabs: Array<{
      label: string;
      filter: string;
    }>;
  };
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductTabs({ config, products, onAddToCart }: ProductTabsProps) {
  if (!config.enabled || !config.tabs || config.tabs.length === 0) return null;

  const [activeTab, setActiveTab] = useState(config.tabs[0]?.filter || "all");
  
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    if (activeTab === "on_sale") return products.filter(p => p.discount_percentage > 0);
    if (activeTab === "new") return products.filter(p => p.is_new);
    if (activeTab === "best_sellers" || activeTab === "featured") return products.filter(p => p.is_featured);
    return products;
  }, [activeTab, products]);
  
  return (
    <section id="produtos" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-8">
          {config.title}
        </h2>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-12" style={{ gridTemplateColumns: `repeat(${config.tabs.length}, 1fr)` }}>
            {config.tabs.map((tab) => (
              <TabsTrigger key={tab.filter} value={tab.filter}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={`${activeTab}-${product.id}`}
                  product={product}
                  index={index}
                  onAddToCart={onAddToCart}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
            </div>
          )}
        </Tabs>
      </div>
    </section>
  );
}
