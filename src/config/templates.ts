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
  mockProducts?: Array<{
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image_url: string;
    is_featured: boolean;
    is_new: boolean;
    discount_percentage: number;
  }>;
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
    cardStyle: "minimal",
    mockProducts: [
      {
        name: "Ténis Nike Air Max",
        description: "Ténis confortável para o dia a dia com tecnologia de absorção de impacto",
        price: 3500,
        stock: 15,
        category: "Calçados",
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&fm=webp",
        is_featured: true,
        is_new: true,
        discount_percentage: 0,
      },
      {
        name: "Relógio Smartwatch",
        description: "Acompanha tua atividade física e notificações do telemóvel",
        price: 2800,
        stock: 8,
        category: "Acessórios",
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&fm=webp",
        is_featured: true,
        is_new: false,
        discount_percentage: 15,
      },
      {
        name: "Mochila Executiva",
        description: "Ideal para trabalho e viagens, compartimento para laptop",
        price: 1500,
        stock: 20,
        category: "Acessórios",
        image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&fm=webp",
        is_featured: false,
        is_new: true,
        discount_percentage: 0,
      },
      {
        name: "Camisa Polo Premium",
        description: "100% algodão, disponível em várias cores",
        price: 800,
        stock: 30,
        category: "Roupas",
        image_url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&fm=webp",
        is_featured: false,
        is_new: false,
        discount_percentage: 10,
      },
    ]
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
    cardStyle: "classic",
    mockProducts: [
      {
        name: "Laptop Dell i7 16GB",
        description: "Computador potente para trabalho e entretenimento",
        price: 45000,
        stock: 5,
        category: "Eletrônicos",
        image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&fm=webp",
        is_featured: true,
        is_new: true,
        discount_percentage: 10,
      },
      {
        name: "Smartphone Samsung Galaxy",
        description: "Câmera de alta qualidade e desempenho excepcional",
        price: 28000,
        stock: 12,
        category: "Eletrônicos",
        image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&fm=webp",
        is_featured: true,
        is_new: false,
        discount_percentage: 0,
      },
      {
        name: "Colchão Ortopédico Queen",
        description: "Máximo conforto e suporte para coluna",
        price: 15000,
        stock: 8,
        category: "Casa",
        image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&fm=webp",
        is_featured: false,
        is_new: true,
        discount_percentage: 15,
      },
      {
        name: "Bola de Futebol Profissional",
        description: "Qualidade FIFA, ideal para jogos e treinos",
        price: 1200,
        stock: 25,
        category: "Esporte",
        image_url: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=300&fm=webp",
        is_featured: false,
        is_new: false,
        discount_percentage: 0,
      },
    ]
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
    cardStyle: "classic",
    mockProducts: [
      {
        name: "Vestido de Noite Elegante",
        description: "Perfeito para eventos formais e ocasiões especiais",
        price: 5500,
        stock: 6,
        category: "Roupas",
        image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&fm=webp",
        is_featured: true,
        is_new: true,
        discount_percentage: 20,
      },
      {
        name: "Perfume Luxo 100ml",
        description: "Fragrância sofisticada que perdura o dia todo",
        price: 3200,
        stock: 15,
        category: "Beleza",
        image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&fm=webp",
        is_featured: true,
        is_new: false,
        discount_percentage: 0,
      },
      {
        name: "Anel de Prata 925",
        description: "Design clássico com acabamento premium",
        price: 2800,
        stock: 10,
        category: "Joias",
        image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
        is_featured: false,
        is_new: true,
        discount_percentage: 10,
      },
      {
        name: "Sapatos de Salto Alto",
        description: "Conforto e elegância para qualquer ocasião",
        price: 2500,
        stock: 18,
        category: "Calçados",
        image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500",
        is_featured: false,
        is_new: false,
        discount_percentage: 15,
      },
    ]
  }
};
