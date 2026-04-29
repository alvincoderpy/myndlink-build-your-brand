import type { Tables } from "@/integrations/supabase/types";
import type { TemplateConfig } from "@/types/template";

export type Store = Omit<Tables<"stores">, "template_config"> & {
  template_config: TemplateConfig | null;
};

export type PublicStore = Omit<Tables<"public_stores">, "template_config"> & {
  template_config: TemplateConfig | null;
};

