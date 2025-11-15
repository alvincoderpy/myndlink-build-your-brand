import { useState } from "react";
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface StorefrontHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  cartCount: number;
  onCartClick: () => void;
}

export function StorefrontHeader({ 
  storeName, 
  logoUrl, 
  cartCount,
  onCartClick 
}: StorefrontHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Search (Desktop) / Menu (Mobile) */}
            <div className="flex-1 max-w-xs">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produtos"
                  className="pl-10 border-0 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Center: Logo */}
            <div className="flex-1 text-center">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 mx-auto object-contain" />
              ) : (
                <h1 className="text-xl md:text-2xl font-serif lowercase tracking-wider">
                  {storeName}
                </h1>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                onClick={onCartClick}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation (Desktop) */}
        <nav className="border-t hidden md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center justify-center gap-8 py-3 text-sm">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#loja" className="hover:underline">Loja</a></li>
              <li><a href="#produtos" className="hover:underline">Produtos</a></li>
              <li><a href="#sobre" className="hover:underline">Sobre</a></li>
              <li><a href="#contato" className="hover:underline">Contato</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-serif">{storeName}</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produtos"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <nav>
                <ul className="space-y-2">
                  <li><a href="#home" className="block py-2 text-lg hover:text-primary">Home</a></li>
                  <li><a href="#loja" className="block py-2 text-lg hover:text-primary">Loja</a></li>
                  <li><a href="#produtos" className="block py-2 text-lg hover:text-primary">Produtos</a></li>
                  <li><a href="#sobre" className="block py-2 text-lg hover:text-primary">Sobre</a></li>
                  <li><a href="#contato" className="block py-2 text-lg hover:text-primary">Contato</a></li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
