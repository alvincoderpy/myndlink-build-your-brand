import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Globe, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const { t } = useTranslation();
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="bg-clip-text text-foreground mx-0 px-0">Myndlink</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="py-0 mx-0 px-0">{t('nav.login')}</Button>
            </Link>
            <Link to="/auth">
              <Button>{t('nav.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title')}
              <br />
              <span className="bg-clip-text text-foreground">
                {t('hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t('hero.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  {t('hero.cta')} <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  {t('hero.viewPricing')}
                </Button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

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

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.free.name')}</h3>
              <div className="text-3xl font-bold mb-4">{t('pricing.free.price')}<span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.free.feature1')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.free.feature2')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.free.feature3')}
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.grow.name')}</h3>
              <div className="text-3xl font-bold mb-4">{t('pricing.grow.price')}<span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.grow.feature1')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.grow.feature2')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.grow.feature3')}
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 border-2 border-border shadow-lg rounded-md px-[24px] mx-0 my-0 py-[24px]">
              <div className="text-xs font-bold text-foreground mb-2 rounded-none mx-0">{t('pricing.business.popular')}</div>
              <h3 className="text-xl font-bold mb-2">{t('pricing.business.name')}</h3>
              <div className="text-3xl font-bold mb-4">{t('pricing.business.price')}<span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.business.feature1')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.business.feature2')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.business.feature3')}
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.enterprise.name')}</h3>
              <div className="text-3xl font-bold mb-4">{t('pricing.enterprise.price')}<span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.enterprise.feature1')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.enterprise.feature2')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  {t('pricing.enterprise.feature3')}
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button>{t('pricing.viewAll')}</Button>
            </Link>
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
            <Button size="lg" className="text-lg py-6 px-[24px]">
              {t('cta.button')} <ArrowRight className="ml-2" />
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