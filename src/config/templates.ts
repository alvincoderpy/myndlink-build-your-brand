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
