import { Facebook, Instagram, Twitter } from "lucide-react";

interface StorefrontFooterProps {
  storeName: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export function StorefrontFooter({ storeName, socialLinks }: StorefrontFooterProps) {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-lg mb-4">Sobre</h3>
            <p className="text-sm text-muted-foreground">
              {storeName} - A sua loja online de confiança.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#loja" className="text-muted-foreground hover:text-foreground">Loja</a></li>
              <li><a href="#produtos" className="text-muted-foreground hover:text-foreground">Produtos</a></li>
              <li><a href="#sobre" className="text-muted-foreground hover:text-foreground">Sobre Nós</a></li>
              <li><a href="#contato" className="text-muted-foreground hover:text-foreground">Contato</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="font-serif text-lg mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
              <li><a href="#envio" className="text-muted-foreground hover:text-foreground">Envio</a></li>
              <li><a href="#devolucoes" className="text-muted-foreground hover:text-foreground">Devoluções</a></li>
              <li><a href="#termos" className="text-muted-foreground hover:text-foreground">Termos</a></li>
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h3 className="font-serif text-lg mb-4">Siga-nos</h3>
            <div className="flex gap-4">
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center pt-8 border-t text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
