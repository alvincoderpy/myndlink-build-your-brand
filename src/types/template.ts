import type { Json } from "@/integrations/supabase/types";
import type { EditorSectionId } from "@/types/editor";

export interface TemplateCategory {
  id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface TemplateTopBar {
  enabled?: boolean;
  showAnnouncement?: boolean;
  announcement?: string;
  showSocial?: boolean;
  showLanguage?: boolean;
  showCurrency?: boolean;
  socialProof?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  backgroundColor?: string;
  textColor?: string;
}

export interface TemplateHero {
  showHero?: boolean;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  showPromo?: boolean;
  promoText?: string;
  overlayColor?: string;
  titleColor?: string;
  buttonColor?: string;
  enabled?: boolean;
  backgroundColor?: string;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
  muted?: string;
}

export interface TemplateConfig {
  name?: string;
  colors: TemplateColors;
  fonts?: {
    heading?: string;
    body?: string;
  };
  topBar?: TemplateTopBar;
  hero?: TemplateHero;
  categories?:
    | TemplateCategory[]
    | {
        enabled?: boolean;
        title?: string;
        items?: Array<{ name: string; image: string; link: string }>;
      };
  productTabs?: {
    enabled?: boolean;
    title?: string;
    tabs?: Array<{ label: string; filter: string }>;
  };
  layout?: "grid";
  cardStyle?: "minimal" | "classic";

  // ✅ ADICIONADO: antes só estava coberto pelo index signature genérico,
  //    o que tornava o tipo invisível para TypeScript e causava aviso em strict mode.
  categoryBackgroundColor?: string;

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
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  editor?: {
    sectionOrder?: EditorSectionId[];
    hiddenSections?: EditorSectionId[];
    hiddenBlocks?: string[];
  };
  [key: string]: Json | unknown;
}

export type TemplateId = string;

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  tags: string[];
  previewImage?: string | null;
  defaults: TemplateConfig;
  capabilities?: {
    sections: Array<{
      id: EditorSectionId;
      label: string;
      supportsBlocks?: boolean;
    }>;
  };
}
