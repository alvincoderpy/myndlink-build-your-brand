import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Globe, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
const Landing = () => {
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="gradient-primary bg-clip-text text-neutral-950">Myndlink</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Crie sua Loja Online
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                em Minutos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Plataforma completa para vender online. Subdomínio gratuito, templates responsivos e sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  Começa hoje. Grátis <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Ver Preços
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Sem cartão de crédito. Comece grátis agora.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Tudo que Precisas para Vender Online</h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas profissionais para o teu negócio crescer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 bg-slate-950">
                <Zap className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rápido e Simples</h3>
              <p className="text-muted-foreground">
                Cria a tua loja em minutos com templates prontos. Sem código, sem complicação.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 bg-slate-950">
                <Globe className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Subdomínio Grátis</h3>
              <p className="text-muted-foreground">
                Recebe tuaLoja.myndlink.com gratuitamente. Upgrade para domínio próprio quando quiseres.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 bg-slate-950">
                <CreditCard className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Pagamentos Integrados</h3>
              <p className="text-muted-foreground">
                Aceita M-Pesa, eMola e Cartão. Pagamentos seguros e fáceis para os teus clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planos para Todos os Negócios</h2>
            <p className="text-xl text-muted-foreground">Começa grátis e evolui conforme cresces.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">0 MT<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  10 produtos
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  1 template
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Grow</h3>
              <div className="text-3xl font-bold mb-4">199 MT<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  50 produtos
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  2 templates
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 border border-primary shadow-glow rounded-md px-[24px] mx-0 my-0 py-[24px]">
              <div className="text-xs font-bold text-primary mb-2 rounded-none mx-0">MAIS POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <div className="text-3xl font-bold mb-4">399 MT<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  200 produtos
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Domínio próprio
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">799 MT<span className="text-sm text-muted-foreground">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Ilimitado
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Personalização
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button>Ver Todos os Planos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junta-te a milhares de empreendedores que já criaram suas lojas online
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 py-6">
              Criar Minha Loja Grátis <ArrowRight className="ml-2" />
            </Button>
          </Link>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; 2025 MyndLink. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>;
};
export default Landing;