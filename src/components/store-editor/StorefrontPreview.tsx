import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { HeroSection } from "@/components/storefront/HeroSection";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { TopBar } from "@/components/storefront/TopBar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { EditorSectionId, EditorSelection } from "@/types/editor";
import type { Product } from "@/types/product";
import type { TemplateCategory, TemplateConfig } from "@/types/template";

interface StorefrontPreviewProps {
  config: TemplateConfig;
  storeName: string;
  storeId?: string;
  viewMode: "desktop" | "tablet" | "mobile";
  activeSection: string;
  inspectorEnabled?: boolean;
  selectedNode?: EditorSelection | null;
  onSelectNode?: (selection: EditorSelection) => void;
  supportedSections?: EditorSectionId[];
}

const SECTION_ORDER: EditorSectionId[] = [
  "topbar",
  "branding",
  "hero",
  "categories",
  "products",
];

function sectionVisible(config: TemplateConfig, sectionId: EditorSectionId): boolean {
  const hidden = config.editor?.hiddenSections ?? [];
  if (hidden.includes(sectionId)) return false;
  if (sectionId === "topbar") return config.topBar?.enabled !== false;
  if (sectionId === "hero") return config.hero?.showHero !== false;
  if (sectionId === "categories") {
    if (Array.isArray(config.categories)) return config.categories.length > 0;
    return config.categories?.enabled !== false;
  }
  if (sectionId === "products") return config.productTabs?.enabled !== false;
  return true;
}

function sectionBlocks(config: TemplateConfig, sectionId: EditorSectionId): Array<{ id: string; label: string }> {
  if (sectionId === "categories") {
    if (!Array.isArray(config.categories)) return [];
    return config.categories.map((item, index) => ({
      id: `categories:${index}`,
      label: item.name || `Categoria ${index + 1}`,
    }));
  }
  if (sectionId === "products") {
    const tabs = config.productTabs?.tabs ?? [];
    return tabs.map((tab, index) => ({
      id: `products:${index}`,
      label: tab.label || `Tab ${index + 1}`,
    }));
  }
  return [];
}

export function StorefrontPreview({
  config,
  storeName,
  storeId,
  viewMode,
  activeSection,
  inspectorEnabled = false,
  selectedNode,
  onSelectNode,
  supportedSections,
}: StorefrontPreviewProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [hoveredSection, setHoveredSection] = useState<EditorSectionId | null>(null);

  useEffect(() => {
    const target = sectionRefs.current[activeSection];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSection]);

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

    void loadProducts();

    const handleUpdate = () => {
      void loadProducts();
    };

    window.addEventListener("products-updated", handleUpdate);
    return () => window.removeEventListener("products-updated", handleUpdate);
  }, [storeId]);

  const mockProducts = [
    {
      id: "1",
      name: "Casaco Premium",
      price: 2499,
      image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
      category: "roupas",
      is_featured: true,
      is_new: true,
      discount_percentage: 0,
      description: "Casaco de inverno",
      stock: 15,
      is_active: true,
    },
    {
      id: "2",
      name: "Tenis Air",
      price: 3999,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      category: "calcados",
      is_featured: false,
      is_new: false,
      discount_percentage: 25,
      description: "Tenis de alta performance",
      stock: 8,
      is_active: true,
    },
  ] as Product[];

  const productsToDisplay = realProducts.length > 0 ? realProducts : mockProducts;

  const containerWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const order = useMemo(() => {
    const baseOrder = supportedSections?.length ? supportedSections : SECTION_ORDER;
    const configured = config.editor?.sectionOrder ?? [];
    const merged = [...configured, ...baseOrder].filter(
      (id, index, arr): id is EditorSectionId =>
        baseOrder.includes(id as EditorSectionId) && arr.indexOf(id) === index,
    );
    return merged.filter((sectionId) => sectionVisible(config, sectionId));
  }, [config, supportedSections]);

  const topBarConfig = {
    backgroundColor: config.topBar?.backgroundColor ?? config.colors.accent,
    textColor: config.topBar?.textColor ?? config.colors.primary,
    socialProof: "@" + storeName.toLowerCase().replace(/\s+/g, ""),
    announcement:
      config.topBar?.announcement || "Frete gratis em compras acima de 500 MT",
    showLanguage: true,
    showCurrency: true,
  };

  const heroConfig = {
    enabled: config.hero?.showHero !== false,
    title: config.hero?.title || `Bem-vindo a ${storeName}`,
    subtitle: config.hero?.subtitle || "Descubra produtos incriveis",
    ctaText: config.hero?.ctaText || "Ver Produtos",
    ctaLink: config.hero?.ctaLink || "#produtos",
    promoText: config.hero?.promoText || "Entrega rapida e pagamento seguro",
    backgroundColor: config.hero?.backgroundColor || config.colors.secondary,
  };

  const categoryConfig = {
    enabled: config.categories && (Array.isArray(config.categories) ? config.categories.length > 0 : true),
    title:
      (Array.isArray(config.categories) ? "Categorias" : config.categories?.title) ||
      "Categorias",
    items: (Array.isArray(config.categories) ? config.categories : []).map(
      (cat: TemplateCategory) => ({
        name: cat.name,
        image:
          cat.image ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        link: `#categoria-${cat.slug}`,
      }),
    ),
  };

  const productTabsConfig = {
    enabled: true,
    title: config.productTabs?.title || "Nossos Produtos",
    tabs: config.productTabs?.tabs ?? [
      { label: "Todos", filter: "all" },
      { label: "Destaque", filter: "featured" },
    ],
  };

  const renderSection = (sectionId: EditorSectionId) => {
    if (!sectionVisible(config, sectionId)) return null;
    const isSelected = selectedNode?.sectionId === sectionId;
    const sectionBlockList = sectionBlocks(config, sectionId);
    const isHovered = hoveredSection === sectionId;

    const wrapperClass = cn(
      "relative transition-all duration-300",
      activeSection === sectionId && "ring-2 ring-primary/60",
      inspectorEnabled && isHovered && "ring-2 ring-blue-500/60",
      inspectorEnabled && isSelected && "ring-2 ring-emerald-500/80",
    );

    const onSectionClick = () => {
      if (!inspectorEnabled || !onSelectNode) return;
      onSelectNode({ type: "section", sectionId });
    };

    const blockOverlay =
      inspectorEnabled && sectionBlockList.length > 0 ? (
        <div className="absolute right-2 top-2 z-20 flex flex-wrap gap-1 max-w-[70%] justify-end">
          {sectionBlockList.map((block) => {
            const isBlockSelected =
              selectedNode?.type === "block" && selectedNode.blockId === block.id;
            return (
              <button
                key={block.id}
                type="button"
                className={cn(
                  "rounded-md border border-border bg-background/90 px-2 py-0.5 text-[10px]",
                  isBlockSelected && "border-emerald-500 text-emerald-600",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectNode?.({ type: "block", sectionId, blockId: block.id });
                }}
              >
                {block.label}
              </button>
            );
          })}
        </div>
      ) : null;

    return (
      <div
        key={sectionId}
        ref={(element) => {
          sectionRefs.current[sectionId] = element;
        }}
        className={wrapperClass}
        onMouseEnter={() => {
          if (inspectorEnabled) setHoveredSection(sectionId);
        }}
        onMouseLeave={() => {
          if (inspectorEnabled) setHoveredSection(null);
        }}
        onClick={onSectionClick}
      >
        {blockOverlay}
        {sectionId === "topbar" ? <TopBar config={topBarConfig} /> : null}
        {sectionId === "branding" ? (
          <StorefrontHeader
            storeName={storeName}
            logoUrl={config.branding?.logo}
            cartCount={0}
            onCartClick={() => {}}
          />
        ) : null}
        {sectionId === "hero" ? (
          <HeroSection
            config={heroConfig}
            featuredProducts={productsToDisplay.filter((p) => p.is_featured)}
          />
        ) : null}
        {sectionId === "categories" ? <CategoryGrid config={categoryConfig} /> : null}
        {sectionId === "products" ? (
          <ProductTabs
            config={productTabsConfig}
            products={productsToDisplay}
            onAddToCart={() => {}}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex justify-center bg-muted/20 overflow-auto">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
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
            {order.map((sectionId) => renderSection(sectionId))}
            <StorefrontFooter storeName={storeName} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
