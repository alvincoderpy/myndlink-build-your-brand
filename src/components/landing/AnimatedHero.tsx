import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const titles = ["incrível", "novo", "fantástico", "bonito", "inteligente"];

export function AnimatedHero() {
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl tracking-tight mb-6">
            <span className="block font-normal">Isto é algo</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={titleIndex}
                initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="block font-bold text-primary"
              >
                {titles[titleIndex]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            Simplificamos o comércio para pequenas e médias empresas. Cria a tua loja online em minutos e começa a vender hoje.
          </p>

          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Criar conta grátis
              <MoveRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
