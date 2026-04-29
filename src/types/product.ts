import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export type CartItem = Product & {
  quantity: number;
};

