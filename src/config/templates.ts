export const templates = {
  // Premium Templates
  prestige: {
    name: "Prestige",
    colors: {
      primary: "0 0% 0%",
      secondary: "0 0% 98%",
      accent: "47 100% 60%"
    },
    fonts: { heading: "font-serif", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "elegant" as const
  },
  empire: {
    name: "Empire",
    colors: {
      primary: "210 50% 10%",
      secondary: "210 30% 98%",
      accent: "10 80% 45%"
    },
    fonts: { heading: "font-serif", body: "font-sans" },
    layout: "masonry" as const,
    cardStyle: "elegant" as const
  },
  atelier: {
    name: "Atelier",
    colors: {
      primary: "0 0% 15%",
      secondary: "30 20% 96%",
      accent: "25 85% 55%"
    },
    fonts: { heading: "font-light", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "soft" as const
  },
  dawn: {
    name: "Dawn",
    colors: {
      primary: "200 70% 30%",
      secondary: "200 30% 97%",
      accent: "200 90% 45%"
    },
    fonts: { heading: "font-bold", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "modern" as const
  },
  minimal: {
    name: "Minimal",
    colors: {
      primary: "0 0% 10%",
      secondary: "0 0% 97%",
      accent: "0 0% 40%"
    },
    fonts: { heading: "font-light", body: "font-sans" },
    layout: "list" as const,
    cardStyle: "soft" as const
  },
  impulse: {
    name: "Impulse",
    colors: {
      primary: "340 80% 40%",
      secondary: "0 0% 98%",
      accent: "340 100% 50%"
    },
    fonts: { heading: "font-bold", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "modern" as const
  },
  vogue: {
    name: "Vogue",
    colors: {
      primary: "0 0% 5%",
      secondary: "0 0% 96%",
      accent: "350 70% 50%"
    },
    fonts: { heading: "font-serif", body: "font-sans" },
    layout: "masonry" as const,
    cardStyle: "elegant" as const
  },
  vertex: {
    name: "Vertex",
    colors: {
      primary: "250 80% 30%",
      secondary: "250 30% 97%",
      accent: "250 100% 60%"
    },
    fonts: { heading: "font-bold", body: "font-mono" },
    layout: "grid" as const,
    cardStyle: "modern" as const
  },
  
  // Classic Templates
  fashion: {
    name: "Fashion Elite",
    colors: {
      primary: "222 47% 11%",
      secondary: "0 0% 98%",
      accent: "47 100% 52%"
    },
    fonts: { heading: "font-bold", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "elegant" as const
  },
  electronics: {
    name: "Electronics",
    colors: {
      primary: "213 94% 22%",
      secondary: "210 40% 96%",
      accent: "217 91% 60%"
    },
    fonts: { heading: "font-bold", body: "font-sans" },
    layout: "grid" as const,
    cardStyle: "modern" as const
  },
  beauty: {
    name: "Beauty",
    colors: {
      primary: "340 75% 45%",
      secondary: "340 50% 98%",
      accent: "340 100% 55%"
    },
    fonts: { heading: "font-light", body: "font-sans" },
    layout: "masonry" as const,
    cardStyle: "soft" as const
  }
};

export type TemplateConfig = typeof templates.fashion;
