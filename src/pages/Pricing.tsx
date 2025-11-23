import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useForceTheme } from "@/hooks/useForceTheme";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  useForceTheme("light");
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.plans.free.name"),
      price: t("pricing.plans.free.price"),
      period: t("pricing.period"),
      description: t("pricing.plans.free.description"),
      features: t("pricing.plans.free.features", { returnObjects: true }) as string[],
      cta: t("pricing.cta.free"),
      popular: false,
    },
    {
      name: t("pricing.plans.grow.name"),
      price: t("pricing.plans.grow.price"),
      period: t("pricing.period"),
      description: t("pricing.plans.grow.description"),
      features: t("pricing.plans.grow.features", { returnObjects: true }) as string[],
      cta: t("pricing.cta.grow"),
      popular: false,
    },
    {
      name: t("pricing.plans.business.name"),
      price: t("pricing.plans.business.price"),
      period: t("pricing.period"),
      description: t("pricing.plans.business.description"),
      features: t("pricing.plans.business.features", { returnObjects: true }) as string[],
      cta: t("pricing.cta.business"),
      popular: true,
    },
    {
      name: t("pricing.plans.enterprise.name"),
      price: t("pricing.plans.enterprise.price"),
      period: t("pricing.period"),
      description: t("pricing.plans.enterprise.description"),
      features: t("pricing.plans.enterprise.features", { returnObjects: true }) as string[],
      cta: t("pricing.cta.enterprise"),
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b-2 border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold">Myndlink</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="mx-0 py-0 my-0 px-[4px]">
                {t("pricing.nav.login")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button>{t("pricing.nav.startFree")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 relative ${
                  plan.popular ? "border-2 border-border scale-105 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-muted text-foreground px-4 py-1 rounded-full text-xs font-bold">
                      {t("pricing.mostPopular")}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground italic">
              {t("pricing.disclaimer")}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">{t("pricing.ready.title")}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("pricing.ready.subtitle")}
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg h-12 px-[40px]">
              {t("pricing.ready.cta")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 MyndLink. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
