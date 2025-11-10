import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { TopBar } from "@/components/storefront/TopBar";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { HeroSection } from "@/components/storefront/HeroSection";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface StorefrontPreviewProps {
  config: any;
  storeName: string;
  storeId?: string;
  viewMode: "desktop" | "tablet" | "mobile";
  activeSection: string;
}

export function StorefrontPreview({ config, storeName, storeId, viewMode, activeSection }: StorefrontPreviewProps) {
  const topBarRef = useRef<HTMLDivElement>(null);
  const brandingRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [realProducts, setRealProducts] = useState<any[]>([]);

  useEffect(() => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      topbar: topBarRef,
      branding: brandingRef,
      hero: heroRef,
      categories: categoriesRef,
      products: productsRef,
    };

    const targetRef = refs[activeSection];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeSection]);

  // Carregar produtos reais
  useEffect(() => {
    if (!storeId) return;
    
    const loadProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .limit(8);
      
      if (data && data.length > 0) {
        setRealProducts(data);
      }
    };
    
    loadProducts();

    // Escutar por atualizações
    const handleUpdate = () => loadProducts();
    window.addEventListener("products-updated", handleUpdate);
    return () => window.removeEventListener("products-updated", handleUpdate);
  }, [storeId]);

  const mockProducts = [
    {
      id: "1",
      name: "Casaco Lã Premium Inverno 2025",
      price: 2499.0,
      image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
      category: "roupas",
      is_featured: true,
      is_new: true,
      discount_percentage: 0,
      description: "Casaco de lã merino 100% natural, perfeito para o inverno",
      stock: 15,
      is_active: true,
    },
    {
      id: "2",
      name: "Ténis Desportivos Nike Air Max",
      price: 3999.0,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      category: "calcados",
      is_featured: false,
      is_new: false,
      discount_percentage: 25,
      description: "Ténis de alta performance com tecnologia Air",
      stock: 8,
      is_active: true,
    },
    {
      id: "3",
      name: "Bolsa Couro Artesanal",
      price: 1899.0,
      image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
      category: "acessorios",
      is_featured: true,
      is_new: true,
      discount_percentage: 0,
      description: "Bolsa de couro genuíno feita à mão",
      stock: 5,
      is_active: true,
    },
    {
      id: "4",
      name: "Óculos de Sol Ray-Ban Aviador",
      price: 899.0,
      image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
      category: "acessorios",
      is_featured: true,
      is_new: false,
      discount_percentage: 15,
      description: "Óculos clássicos com proteção UV400",
      stock: 20,
      is_active: true,
    },
    {
      id: "5",
      name: "Relógio Smartwatch Pro",
      price: 1599.0,
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      category: "acessorios",
      is_featured: false,
      is_new: true,
      discount_percentage: 0,
      description: "Relógio inteligente com monitor cardíaco",
      stock: 12,
      is_active: true,
    },
    {
      id: "6",
      name: "Vestido Longo Primavera",
      price: 1299.0,
      image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
      category: "roupas",
      is_featured: false,
      is_new: false,
      discount_percentage: 30,
      description: "Vestido leve e elegante para o verão",
      stock: 10,
      is_active: true,
    },
    {
      id: "7",
      name: "Mochila Executiva Preta",
      price: 799.0,
      image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      category: "acessorios",
      is_featured: false,
      is_new: false,
      discount_percentage: 0,
      description: "Mochila resistente com compartimento para laptop",
      stock: 18,
      is_active: true,
    },
    {
      id: "8",
      name: "Botas de Couro Chelsea",
      price: 2199.0,
      image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f",
      category: "calcados",
      is_featured: true,
      is_new: false,
      discount_percentage: 20,
      description: "Botas elegantes em couro premium",
      stock: 7,
      is_active: true,
    },
  ];

  // Usar produtos reais se existirem, senão usar mock
  const productsToDisplay = realProducts.length > 0 ? realProducts : mockProducts;

  const containerWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const topBarConfig = {
    backgroundColor: config.colors.accent,
    textColor: config.colors.primary,
    socialProof: "@" + storeName.toLowerCase().replace(/\s+/g, ""),
    announcement: config.topBar?.announcement || "Frete grátis em compras acima de 500 MT",
    showLanguage: true,
    showCurrency: true,
  };

  const heroConfig = {
    enabled: config.hero?.showHero !== false,
    title: config.hero?.title || `Bem-vindo a ${storeName}`,
    subtitle: config.hero?.subtitle || "Descubra produtos incríveis",
    ctaText: "Ver Produtos",
    ctaLink: "#produtos",
    promoText: "Entrega rápida • Pagamento seguro • Garantia de qualidade",
    backgroundColor: config.colors.secondary,
  };

  const categoryConfig = {
    enabled: config.categories && config.categories.length > 0,
    title: "Categorias",
    items: (config.categories || []).map((cat: any) => ({
      name: cat.name,
      image: cat.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      link: `#categoria-${cat.slug}`,
    })),
  };

  const productTabsConfig = {
    enabled: true,
    title: "Nossos Produtos",
    tabs: [
      { label: "Todos", filter: "all" },
      { label: "Em Destaque", filter: "featured" },
      { label: "Novidades", filter: "new" },
      { label: "Promoções", filter: "on_sale" },
    ],
  };

  return (
    <div className="w-full h-full flex justify-center bg-muted/20 overflow-auto">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="transition-all duration-300 ease-in-out h-full shadow-xl"
        style={{
          width: containerWidth[viewMode],
          maxWidth: "100%",
        }}
      >
        <Card className="w-full h-full overflow-auto">
          <div
            className="min-h-full"
            style={{
              backgroundColor: `hsl(${config.colors.secondary})`,
              color: `hsl(${config.colors.primary})`,
            }}
          >
            <div 
              ref={topBarRef}
              className={cn(
                "transition-all duration-500",
                activeSection === "topbar" && "ring-4 ring-primary ring-offset-4 animate-pulse"
              )}
            >
              <TopBar config={topBarConfig} />
            </div>

            <div 
              ref={brandingRef}
              className={cn(
                "transition-all duration-500",
                activeSection === "branding" && "ring-4 ring-primary ring-offset-4"
              )}
            >
              <StorefrontHeader
                storeName={storeName}
                logoUrl={config.branding?.logo}
                cartCount={0}
                onCartClick={() => {}}
              />
            </div>

            <div 
              ref={heroRef}
              className={cn(
                "transition-all duration-500",
                activeSection === "hero" && "ring-4 ring-primary ring-offset-4"
              )}
            >
              <HeroSection
                config={heroConfig}
                featuredProducts={productsToDisplay.filter((p) => p.is_featured)}
              />
            </div>

            <div 
              ref={categoriesRef}
              className={cn(
                "transition-all duration-500",
                activeSection === "categories" && "ring-4 ring-primary ring-offset-4"
              )}
            >
              <CategoryGrid config={categoryConfig} />
            </div>

            <div 
              ref={productsRef}
              className={cn(
                "transition-all duration-500",
                activeSection === "products" && "ring-4 ring-primary ring-offset-4"
              )}
            >
              <ProductTabs
                config={productTabsConfig}
                products={productsToDisplay}
                onAddToCart={() => {}}
              />
            </div>

            <StorefrontFooter storeName={storeName} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
