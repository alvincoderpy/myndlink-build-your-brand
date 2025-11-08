import { Card } from "@/components/ui/card";
import { TopBar } from "@/components/storefront/TopBar";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { HeroSection } from "@/components/storefront/HeroSection";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

interface StorefrontPreviewProps {
  config: any;
  storeName: string;
  storeId?: string;
}

export function StorefrontPreview({ config, storeName, storeId }: StorefrontPreviewProps) {
  const mockProducts = [
    {
      id: "1",
      name: "Produto Exemplo 1",
      price: 99.99,
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      category: "acessorios",
      is_featured: true,
      is_new: false,
      discount_percentage: 0,
      description: "Descrição do produto exemplo",
      stock: 10,
      is_active: true,
    },
    {
      id: "2",
      name: "Produto Exemplo 2",
      price: 149.99,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      category: "calcados",
      is_featured: false,
      is_new: true,
      discount_percentage: 20,
      description: "Descrição do produto exemplo",
      stock: 5,
      is_active: true,
    },
    {
      id: "3",
      name: "Produto Exemplo 3",
      price: 79.99,
      image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
      category: "roupas",
      is_featured: true,
      is_new: true,
      discount_percentage: 15,
      description: "Descrição do produto exemplo",
      stock: 8,
      is_active: true,
    },
  ];

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
    <Card className="w-full h-full overflow-auto">
      <div
        className="min-h-full"
        style={{
          backgroundColor: `hsl(${config.colors.secondary})`,
          color: `hsl(${config.colors.primary})`,
        }}
      >
        <TopBar config={topBarConfig} />
        <StorefrontHeader
          storeName={storeName}
          logoUrl={config.branding?.logo}
          cartCount={0}
          onCartClick={() => {}}
        />
        <HeroSection
          config={heroConfig}
          featuredProducts={mockProducts.filter(p => p.is_featured)}
        />
        <CategoryGrid config={categoryConfig} />
        <ProductTabs
          config={productTabsConfig}
          products={mockProducts}
          onAddToCart={() => {}}
        />
        <StorefrontFooter storeName={storeName} />
      </div>
    </Card>
  );
}
