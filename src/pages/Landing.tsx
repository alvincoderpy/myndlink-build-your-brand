import { Button } from "@/components/ui/button";
import { Zap, Globe, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForceTheme } from "@/hooks/useForceTheme";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
const Landing = () => {
  const {
    t
  } = useTranslation();
  useForceTheme("light");
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 flex items-center justify-between py-[24px]">
          <div className="flex items-center gap-2">
            <img src={logoLight} alt="MyndLink" className="h-10 dark:hidden" />
            <img src={logoDark} alt="MyndLink" className="h-10 hidden dark:block" />
            <span className="text-xl font-bold">MyndLink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="py-0 mx-0 px-0">{t('nav.login')}</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary-foreground">{t('nav.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20">
        <AnimatedHero />
      </div>

      {/* Features */}
      <section className="px-6 py-[40px]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted">
                <Zap className="text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('features.fast.title')}</h3>
              <p className="text-muted-foreground">
                {t('features.fast.description')}
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted">
                <Globe className="text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('features.subdomain.title')}</h3>
              <p className="text-muted-foreground">{t('features.subdomain.description')}</p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-card border border-border hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted">
                <CreditCard className="text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('features.payment.title')}</h3>
              <p className="text-muted-foreground">
                {t('features.payment.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('cta.subtitle')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg py-6 px-[24px] bg-blue-600 hover:bg-blue-500">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; 2025 MyndLink. {t('footer.copyright')}</p>
        </div>
      </footer>
    </div>;
};
export default Landing;