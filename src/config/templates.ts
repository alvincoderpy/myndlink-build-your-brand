export interface TemplateConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: "grid" | "list" | "masonry";
  cardStyle: "elegant" | "modern" | "soft";
}

export const templates: Record<string, TemplateConfig> = {
  // ELITE TEMPLATES - Luxury & Elegance
  prestige: {
    name: "Prestige",
    colors: {
      primary: "0 0% 13%",
      secondary: "0 0% 98%",
      accent: "24 100% 50%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "elegant"
  },
  empire: {
    name: "Empire",
    colors: {
      primary: "0 0% 0%",
      secondary: "0 0% 100%",
      accent: "210 50% 40%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-sans"
    },
    layout: "masonry",
    cardStyle: "modern"
  },
  atelier: {
    name: "Atelier",
    colors: {
      primary: "30 8% 25%",
      secondary: "30 12% 96%",
      accent: "155 30% 45%"
    },
    fonts: {
      heading: "font-light",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "soft"
  },

  // ELITE TEMPLATES - Modern & Minimalist
  dawn: {
    name: "Dawn",
    colors: {
      primary: "210 17% 29%",
      secondary: "0 0% 100%",
      accent: "210 100% 54%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "modern"
  },
  minimal: {
    name: "Minimal",
    colors: {
      primary: "0 0% 20%",
      secondary: "0 0% 97%",
      accent: "0 0% 40%"
    },
    fonts: {
      heading: "font-light",
      body: "font-sans"
    },
    layout: "list",
    cardStyle: "elegant"
  },

  // ELITE TEMPLATES - Fashion & Editorial
  impulse: {
    name: "Impulse",
    colors: {
      primary: "340 75% 45%",
      secondary: "0 0% 95%",
      accent: "200 20% 30%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    layout: "masonry",
    cardStyle: "elegant"
  },
  vogue: {
    name: "Vogue",
    colors: {
      primary: "0 0% 10%",
      secondary: "30 5% 98%",
      accent: "355 85% 55%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "elegant"
  },

  // ELITE TEMPLATES - Tech & Innovation
  vertex: {
    name: "Vertex",
    colors: {
      primary: "250 100% 60%",
      secondary: "240 20% 10%",
      accent: "180 100% 50%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-mono"
    },
    layout: "grid",
    cardStyle: "modern"
  },

  // CLASSIC TEMPLATES (compatibility)
  fashion: {
    name: "Moda",
    colors: {
      primary: "0 0% 0%",
      secondary: "0 0% 100%",
      accent: "0 0% 93%"
    },
    fonts: {
      heading: "font-serif",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "elegant"
  },
  electronics: {
    name: "Eletrônicos",
    colors: {
      primary: "221 83% 53%",
      secondary: "217 91% 60%",
      accent: "213 97% 87%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-sans"
    },
    layout: "grid",
    cardStyle: "modern"
  },
  beauty: {
    name: "Beleza",
    colors: {
      primary: "330 81% 60%",
      secondary: "326 85% 90%",
      accent: "327 73% 97%"
    },
    fonts: {
      heading: "font-light",
      body: "font-sans"
    },
    layout: "masonry",
    cardStyle: "soft"
  }
};
