import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

interface HeroSectionProps {
  config: {
    enabled: boolean;
    title: string;
    subtitle?: string;
    ctaText: string;
    ctaLink: string;
    promoText?: string;
    backgroundColor: string;
  };
  featuredProducts: Product[];
}

export function HeroSection({ config, featuredProducts }: HeroSectionProps) {
  if (!config.enabled) return null;

  return (
    <section 
      className="py-12 md:py-16"
      style={{ backgroundColor: `hsl(${config.backgroundColor})` }}
    >
      <div className="container mx-auto px-4">
        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-center mb-12">
            {featuredProducts.slice(0, 3).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative aspect-square overflow-hidden",
                  index === 1 && "md:scale-110 z-10"
                )}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name || 'Produto em destaque'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Sem imagem</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Center Content */}
        <div className="text-center">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {config.title}
          </motion.h2>
          
          {config.subtitle && (
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {config.subtitle}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={() => {
                const element = document.querySelector(config.ctaLink);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {config.ctaText}
            </Button>
          </motion.div>
          
          {config.promoText && (
            <motion.p 
              className="text-sm text-muted-foreground mt-6 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {config.promoText}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
