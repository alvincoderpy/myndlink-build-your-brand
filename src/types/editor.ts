import type { TemplateConfig } from "@/types/template";

export type EditorSectionId =
  | "topbar"
  | "branding"
  | "hero"
  | "categories"
  | "products";

export type EditorNodeType = "section" | "block";

export interface EditorTreeBlock {
  id: string;
  label: string;
  sectionId: EditorSectionId;
  visible: boolean;
}

export interface EditorTreeSection {
  id: EditorSectionId;
  label: string;
  visible: boolean;
  blocks: EditorTreeBlock[];
}

export interface EditorSelection {
  type: EditorNodeType;
  sectionId: EditorSectionId;
  blockId?: string;
}

export interface EditorTreeAction {
  action:
    | "add"
    | "move-up"
    | "move-down"
    | "toggle-visibility"
    | "duplicate"
    | "delete";
  sectionId: EditorSectionId;
  blockId?: string;
}

export interface TemplateMigrationResult {
  config: TemplateConfig;
  changed: boolean;
}
