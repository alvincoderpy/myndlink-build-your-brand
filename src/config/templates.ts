export interface TemplateConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  topBar?: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    socialProof: string;
    announcement: string;
    showLanguage: boolean;
    showCurrency: boolean;
  };
  hero?: {
    enabled: boolean;
    title: string;
    subtitle?: string;
    ctaText: string;
    ctaLink: string;
    promoText?: string;
    backgroundColor: string;
  };
  categories?: {
    enabled: boolean;
    title: string;
    items: Array<{
      name: string;
      image: string;
      link: string;
    }>;
  };
  productTabs?: {
    enabled: boolean;
    title: string;
    tabs: Array<{
      label: string;
      filter: string;
    }>;
  };
  layout: "grid";
  cardStyle: "minimal" | "classic";
}

export const templates: Record<string, TemplateConfig> = {
  minimog: {
    name: "Minimog Fashion",
    colors: {
      primary: "0 0% 0%",
      secondary: "30 15% 95%",
      accent: "0 0% 0%",
      background: "0 0% 100%",
      muted: "0 0% 45%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    topBar: {
      enabled: true,
      backgroundColor: "0 0% 0%",
      textColor: "0 0% 100%",
      socialProof: "300k Seguidores • 100k Seguidores",
      announcement: "As Portas para um Mundo de Moda | Descubra Mais",
      showLanguage: true,
      showCurrency: true
    },
    hero: {
      enabled: true,
      title: "Nova Coleção",
      subtitle: "",
      ctaText: "Comprar Agora",
      ctaLink: "#produtos",
      promoText: "Inscreva-se para 10% de desconto na primeira compra. Válido por dois dias.",
      backgroundColor: "30 15% 95%"
    },
    categories: {
      enabled: true,
      title: "Coleção da Temporada",
      items: [
        { name: "Acessórios", image: "", link: "#acessorios" },
        { name: "Calçados", image: "", link: "#calcados" },
        { name: "Bolsas", image: "", link: "#bolsas" }
      ]
    },
    productTabs: {
      enabled: true,
      title: "Destaques da Semana",
      tabs: [
        { label: "Mais Vendidos", filter: "featured" },
        { label: "Em Promoção", filter: "on_sale" },
        { label: "Novidades", filter: "new" }
      ]
    },
    layout: "grid",
    cardStyle: "minimal"
  }
};
