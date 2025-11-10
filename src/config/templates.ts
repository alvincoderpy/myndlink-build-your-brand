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
  },
  
  modern: {
    name: "Modern Business",
    colors: {
      primary: "221 83% 53%",
      secondary: "210 40% 98%",
      accent: "142 76% 36%",
      background: "0 0% 100%",
      muted: "210 40% 96%"
    },
    fonts: {
      heading: "font-sans",
      body: "font-sans"
    },
    topBar: {
      enabled: true,
      backgroundColor: "221 83% 53%",
      textColor: "0 0% 100%",
      socialProof: "Entrega Rápida • Suporte 24/7",
      announcement: "Novos produtos toda semana | Frete grátis acima de 500 MT",
      showLanguage: true,
      showCurrency: true
    },
    hero: {
      enabled: true,
      title: "Sua Loja Moderna",
      subtitle: "Produtos de qualidade para você",
      ctaText: "Ver Catálogo",
      ctaLink: "#produtos",
      promoText: "Pagamento seguro • Entrega garantida • Atendimento personalizado",
      backgroundColor: "210 40% 98%"
    },
    categories: {
      enabled: true,
      title: "Nossas Categorias",
      items: [
        { name: "Eletrônicos", image: "", link: "#eletronicos" },
        { name: "Casa", image: "", link: "#casa" },
        { name: "Esporte", image: "", link: "#esporte" }
      ]
    },
    productTabs: {
      enabled: true,
      title: "Produtos em Destaque",
      tabs: [
        { label: "Todos", filter: "all" },
        { label: "Populares", filter: "featured" },
        { label: "Novos", filter: "new" }
      ]
    },
    layout: "grid",
    cardStyle: "classic"
  },
  
  elegant: {
    name: "Elegant Store",
    colors: {
      primary: "280 80% 50%",
      secondary: "0 0% 98%",
      accent: "340 82% 52%",
      background: "0 0% 100%",
      muted: "0 0% 96%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    topBar: {
      enabled: true,
      backgroundColor: "280 80% 50%",
      textColor: "0 0% 100%",
      socialProof: "Exclusividade • Elegância",
      announcement: "Coleção Premium | Produtos Selecionados",
      showLanguage: true,
      showCurrency: true
    },
    hero: {
      enabled: true,
      title: "Elegância Refinada",
      subtitle: "Descubra nossa seleção especial",
      ctaText: "Explorar",
      ctaLink: "#produtos",
      promoText: "Qualidade premium • Design exclusivo • Atendimento VIP",
      backgroundColor: "0 0% 98%"
    },
    categories: {
      enabled: true,
      title: "Coleções Especiais",
      items: [
        { name: "Luxo", image: "", link: "#luxo" },
        { name: "Premium", image: "", link: "#premium" },
        { name: "Exclusivo", image: "", link: "#exclusivo" }
      ]
    },
    productTabs: {
      enabled: true,
      title: "Nossa Seleção",
      tabs: [
        { label: "Destaques", filter: "featured" },
        { label: "Lançamentos", filter: "new" },
        { label: "Ofertas", filter: "on_sale" }
      ]
    },
    layout: "grid",
    cardStyle: "classic"
  }
};
