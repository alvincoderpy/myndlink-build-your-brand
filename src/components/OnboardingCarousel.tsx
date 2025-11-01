import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const slides = [
  {
    title: "Bem-vindo ao MyndLink! 🎉",
    description: "Vamos mostrar-te como criar e gerir a tua loja online em minutos.",
    icon: "🚀",
  },
  {
    title: "Adiciona os Teus Produtos",
    description: "Vai a 'Produtos' e adiciona itens com fotos, preços e stock. É rápido e simples!",
    icon: "📦",
  },
  {
    title: "Configura a Tua Loja",
    description: "Personaliza o nome, escolhe o subdomínio e publica quando estiveres pronto.",
    icon: "🎨",
  },
  {
    title: "Cria Cupons e Descontos",
    description: "Atrai clientes com promoções especiais. Acede à secção de cupons para começar.",
    icon: "🎫",
  },
  {
    title: "Recebe e Gere Pedidos",
    description: "Quando os clientes comprarem, verás os pedidos na secção 'Pedidos'. Simples assim!",
    icon: "✅",
  },
];

export const OnboardingCarousel = () => {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      handleClose();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <div className="text-center py-6">
          <div className="text-6xl mb-4">{slide.icon}</div>
          <h2 className="text-2xl font-bold mb-3">{slide.title}</h2>
          <p className="text-muted-foreground mb-6">{slide.description}</p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-primary w-6"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="w-24"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <Button onClick={handleNext} className="w-24">
              {currentSlide === slides.length - 1 ? (
                "Começar"
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground mt-4"
          >
            Saltar tutorial
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
