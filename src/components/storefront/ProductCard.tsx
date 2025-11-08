import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount_percentage: number;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, index, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const finalPrice = product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-secondary/30">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            -{product.discount_percentage}%
          </Badge>
        )}
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Esgotado</Badge>
          </div>
        )}
        
        {/* Quick Add Button (appears on hover) */}
        <AnimatePresence>
          {isHovered && product.stock > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4"
            >
              <Button 
                size="sm" 
                className="w-full bg-background text-foreground hover:bg-background/90 shadow-lg"
                onClick={() => onAddToCart(product)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Info */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          {product.discount_percentage > 0 ? (
            <>
              <span className="text-sm line-through text-muted-foreground">
                {product.price.toFixed(2)} MT
              </span>
              <span className="text-base font-semibold">
                {finalPrice.toFixed(2)} MT
              </span>
            </>
          ) : (
            <span className="text-base font-semibold">
              {product.price.toFixed(2)} MT
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
