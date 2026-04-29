import {
  getTemplateDefaults,
  templateList,
  templatesById,
} from "@/config/templates";
import type {
  EditorSectionId,
  EditorSelection,
  EditorTreeAction,
  EditorTreeBlock,
  EditorTreeSection,
  TemplateMigrationResult,
} from "@/types/editor";
import type { TemplateConfig, TemplateId, TemplateMeta } from "@/types/template";

const SECTION_LABELS: Record<EditorSectionId, string> = {
  topbar: "Top bar",
  branding: "Branding",
  hero: "Hero",
  categories: "Categorias",
  products: "Produtos",
};

const DEFAULT_CAPABILITIES: TemplateMeta["capabilities"] = {
  sections: [
    { id: "topbar", label: "Top bar", supportsBlocks: false },
    { id: "branding", label: "Branding", supportsBlocks: false },
    { id: "hero", label: "Hero", supportsBlocks: false },
    { id: "categories", label: "Categorias", supportsBlocks: true },
    { id: "products", label: "Produtos", supportsBlocks: true },
  ],
};

function cloneConfig(config: TemplateConfig): TemplateConfig {
  if (typeof structuredClone === "function") {
    return structuredClone(config);
  }
  return JSON.parse(JSON.stringify(config)) as TemplateConfig;
}

function getSectionSupport(
  templateId: TemplateId | null | undefined,
): TemplateMeta["capabilities"] {
  if (!templateId || !templatesById[templateId]) return DEFAULT_CAPABILITIES;
  return templatesById[templateId].capabilities ?? DEFAULT_CAPABILITIES;
}

export function getSupportedSections(
  templateId: TemplateId | null | undefined,
): EditorSectionId[] {
  return (getSectionSupport(templateId)?.sections.map((section) => section.id) ??
    DEFAULT_CAPABILITIES.sections.map((section) => section.id)) as EditorSectionId[];
}

function getNormalizedOrder(
  config: TemplateConfig,
  templateId: TemplateId | null | undefined,
): EditorSectionId[] {
  const supported = getSectionSupport(templateId)?.sections.map((s) => s.id) ?? [];
  const current = config.editor?.sectionOrder ?? [];
  const merged = [...current, ...supported].filter(
    (id, index, arr): id is EditorSectionId =>
      supported.includes(id as EditorSectionId) &&
      arr.indexOf(id) === index &&
      typeof id === "string",
  );
  return merged.length > 0 ? merged : (supported as EditorSectionId[]);
}

function isSectionVisible(config: TemplateConfig, sectionId: EditorSectionId): boolean {
  const hiddenSections = config.editor?.hiddenSections ?? [];
  if (hiddenSections.includes(sectionId)) return false;

  if (sectionId === "topbar") return config.topBar?.enabled !== false;
  if (sectionId === "hero") return config.hero?.showHero !== false;
  if (sectionId === "categories") {
    if (Array.isArray(config.categories)) return config.categories.length > 0;
    return config.categories?.enabled !== false;
  }
  if (sectionId === "products") return config.productTabs?.enabled !== false;
  return true;
}

function getBlocks(config: TemplateConfig, sectionId: EditorSectionId): EditorTreeBlock[] {
  const hiddenBlocks = config.editor?.hiddenBlocks ?? [];
  if (sectionId === "categories") {
    const categories = Array.isArray(config.categories) ? config.categories : [];
    if (categories.length === 0) {
      return [{ id: "categories:default", label: "Categorias", sectionId, visible: true }];
    }
    return categories.map((category, index) => {
      const id = `categories:${index}`;
      return {
        id,
        label: category.name || `Categoria ${index + 1}`,
        sectionId,
        visible: !hiddenBlocks.includes(id),
      };
    });
  }

  if (sectionId === "products") {
    const tabs = config.productTabs?.tabs ?? [];
    if (tabs.length === 0) {
      return [{ id: "products:default", label: "Produtos", sectionId, visible: true }];
    }
    return tabs.map((tab, index) => {
      const id = `products:${index}`;
      return {
        id,
        label: tab.label || `Tab ${index + 1}`,
        sectionId,
        visible: !hiddenBlocks.includes(id),
      };
    });
  }

  return [];
}

export function buildEditorTree(
  config: TemplateConfig,
  templateId?: TemplateId | null,
): EditorTreeSection[] {
  const order = getNormalizedOrder(config, templateId);
  return order.map((sectionId) => ({
    id: sectionId,
    label: SECTION_LABELS[sectionId],
    visible: isSectionVisible(config, sectionId),
    blocks: getBlocks(config, sectionId),
  }));
}

export function getTemplateName(templateId?: string | null): string {
  if (!templateId || !templatesById[templateId]) return "Minimog Fashion";
  return templatesById[templateId].name;
}

export function getTemplateOptions(): Array<{ id: string; name: string }> {
  return templateList.map((item) => ({ id: item.id, name: item.name }));
}

export function migrateConfigToTemplate(
  currentConfig: TemplateConfig,
  nextTemplateId: string,
): TemplateMigrationResult {
  const defaults = getTemplateDefaults(nextTemplateId);
  const merged: TemplateConfig = {
    ...defaults,
    colors: { ...defaults.colors, ...(currentConfig.colors ?? {}) },
    fonts: { ...defaults.fonts, ...(currentConfig.fonts ?? {}) },
    branding: { ...defaults.branding, ...(currentConfig.branding ?? {}) },
    topBar: { ...defaults.topBar, ...(currentConfig.topBar ?? {}) },
    hero: { ...defaults.hero, ...(currentConfig.hero ?? {}) },
    productTabs: { ...defaults.productTabs, ...(currentConfig.productTabs ?? {}) },
  };

  if (Array.isArray(currentConfig.categories)) {
    merged.categories = currentConfig.categories;
  } else if (!Array.isArray(defaults.categories)) {
    merged.categories = { ...(defaults.categories ?? {}), ...(currentConfig.categories ?? {}) };
  }

  const capabilities = getSectionSupport(nextTemplateId);
  const supportedSections = capabilities?.sections.map((item) => item.id) ?? [];
  const hiddenSections = (merged.editor?.hiddenSections ?? []).filter((sectionId) =>
    supportedSections.includes(sectionId),
  );
  merged.editor = {
    ...merged.editor,
    hiddenSections,
    sectionOrder: supportedSections,
    hiddenBlocks: merged.editor?.hiddenBlocks ?? [],
  };

  return { config: merged, changed: true };
}

function withSectionOrder(
  config: TemplateConfig,
  sectionId: EditorSectionId,
  direction: "up" | "down",
): TemplateConfig {
  const next = cloneConfig(config);
  const order = next.editor?.sectionOrder ?? getNormalizedOrder(next, undefined);
  const index = order.indexOf(sectionId);
  if (index === -1) return next;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= order.length) return next;
  const swapped = [...order];
  [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
  next.editor = { ...next.editor, sectionOrder: swapped };
  return next;
}

function toggleSectionVisibility(config: TemplateConfig, sectionId: EditorSectionId): TemplateConfig {
  const next = cloneConfig(config);
  const hidden = new Set(next.editor?.hiddenSections ?? []);
  if (hidden.has(sectionId)) hidden.delete(sectionId);
  else hidden.add(sectionId);
  next.editor = { ...next.editor, hiddenSections: Array.from(hidden) };
  return next;
}

function addSection(config: TemplateConfig, sectionId: EditorSectionId): TemplateConfig {
  const next = cloneConfig(config);
  if (sectionId === "topbar") next.topBar = { ...next.topBar, enabled: true };
  if (sectionId === "hero") next.hero = { ...next.hero, showHero: true };
  if (sectionId === "categories") {
    next.categories = Array.isArray(next.categories)
      ? next.categories
      : [{ id: crypto.randomUUID(), name: "Nova categoria", slug: "nova-categoria" }];
  }
  if (sectionId === "products") {
    next.productTabs = {
      enabled: true,
      title: next.productTabs?.title || "Produtos",
      tabs: next.productTabs?.tabs?.length
        ? next.productTabs.tabs
        : [{ label: "Todos", filter: "all" }],
    };
  }
  return toggleSectionVisibility(next, sectionId); // toggles if hidden; if visible returns hidden (avoid). fix below
}

function ensureSectionVisible(config: TemplateConfig, sectionId: EditorSectionId): TemplateConfig {
  const next = cloneConfig(config);
  const hidden = new Set(next.editor?.hiddenSections ?? []);
  hidden.delete(sectionId);
  next.editor = { ...next.editor, hiddenSections: Array.from(hidden) };
  return next;
}

function addBlock(config: TemplateConfig, sectionId: EditorSectionId): TemplateConfig {
  const next = cloneConfig(config);
  if (sectionId === "categories") {
    const categories = Array.isArray(next.categories) ? next.categories : [];
    categories.push({
      id: crypto.randomUUID(),
      name: `Categoria ${categories.length + 1}`,
      slug: `categoria-${categories.length + 1}`,
    });
    next.categories = categories;
  }
  if (sectionId === "products") {
    const tabs = next.productTabs?.tabs ? [...next.productTabs.tabs] : [];
    tabs.push({ label: `Tab ${tabs.length + 1}`, filter: "all" });
    next.productTabs = {
      ...(next.productTabs ?? {}),
      enabled: true,
      title: next.productTabs?.title || "Produtos",
      tabs,
    };
  }
  return next;
}

function parseBlockIndex(blockId?: string): number {
  if (!blockId) return -1;
  const value = Number(blockId.split(":")[1]);
  return Number.isFinite(value) ? value : -1;
}

function toggleBlockVisibility(config: TemplateConfig, blockId: string): TemplateConfig {
  const next = cloneConfig(config);
  const hidden = new Set(next.editor?.hiddenBlocks ?? []);
  if (hidden.has(blockId)) hidden.delete(blockId);
  else hidden.add(blockId);
  next.editor = { ...next.editor, hiddenBlocks: Array.from(hidden) };
  return next;
}

function moveBlock(
  config: TemplateConfig,
  sectionId: EditorSectionId,
  blockId: string,
  direction: "up" | "down",
): TemplateConfig {
  const next = cloneConfig(config);
  const index = parseBlockIndex(blockId);
  if (index < 0) return next;

  if (sectionId === "categories" && Array.isArray(next.categories)) {
    const items = [...next.categories];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return next;
    [items[index], items[target]] = [items[target], items[index]];
    next.categories = items;
  }

  if (sectionId === "products" && next.productTabs?.tabs) {
    const items = [...next.productTabs.tabs];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return next;
    [items[index], items[target]] = [items[target], items[index]];
    next.productTabs = { ...next.productTabs, tabs: items };
  }

  return next;
}

function duplicateBlock(
  config: TemplateConfig,
  sectionId: EditorSectionId,
  blockId: string,
): TemplateConfig {
  const next = cloneConfig(config);
  const index = parseBlockIndex(blockId);
  if (index < 0) return next;

  if (sectionId === "categories" && Array.isArray(next.categories) && next.categories[index]) {
    const copy = { ...next.categories[index], id: crypto.randomUUID() };
    next.categories.splice(index + 1, 0, copy);
  }

  if (sectionId === "products" && next.productTabs?.tabs?.[index]) {
    const copy = { ...next.productTabs.tabs[index], label: `${next.productTabs.tabs[index].label} Copy` };
    const tabs = [...next.productTabs.tabs];
    tabs.splice(index + 1, 0, copy);
    next.productTabs = { ...next.productTabs, tabs };
  }

  return next;
}

function deleteBlock(
  config: TemplateConfig,
  sectionId: EditorSectionId,
  blockId: string,
): TemplateConfig {
  const next = cloneConfig(config);
  const index = parseBlockIndex(blockId);
  if (index < 0) return next;

  if (sectionId === "categories" && Array.isArray(next.categories)) {
    next.categories = next.categories.filter((_, idx) => idx !== index);
  }
  if (sectionId === "products" && next.productTabs?.tabs) {
    next.productTabs = {
      ...next.productTabs,
      tabs: next.productTabs.tabs.filter((_, idx) => idx !== index),
    };
  }
  return next;
}

export function applyEditorTreeAction(
  config: TemplateConfig,
  payload: EditorTreeAction,
): TemplateConfig {
  if (payload.action === "add") {
    if (payload.blockId) return addBlock(config, payload.sectionId);
    return ensureSectionVisible(addSection(config, payload.sectionId), payload.sectionId);
  }

  if (!payload.blockId) {
    if (payload.action === "move-up") return withSectionOrder(config, payload.sectionId, "up");
    if (payload.action === "move-down") return withSectionOrder(config, payload.sectionId, "down");
    if (payload.action === "toggle-visibility") return toggleSectionVisibility(config, payload.sectionId);
    if (payload.action === "duplicate")
      return ensureSectionVisible(addSection(config, payload.sectionId), payload.sectionId);
    if (payload.action === "delete")
      return toggleSectionVisibility(ensureSectionVisible(config, payload.sectionId), payload.sectionId);
    return config;
  }

  if (payload.action === "move-up") return moveBlock(config, payload.sectionId, payload.blockId, "up");
  if (payload.action === "move-down")
    return moveBlock(config, payload.sectionId, payload.blockId, "down");
  if (payload.action === "toggle-visibility")
    return toggleBlockVisibility(config, payload.blockId);
  if (payload.action === "duplicate") return duplicateBlock(config, payload.sectionId, payload.blockId);
  if (payload.action === "delete") return deleteBlock(config, payload.sectionId, payload.blockId);
  return config;
}

export function getSelectionLabel(
  tree: EditorTreeSection[],
  selection: EditorSelection | null,
): { section: string; block?: string } {
  if (!selection) return { section: "Secao" };
  const section = tree.find((item) => item.id === selection.sectionId);
  if (!section) return { section: "Secao" };
  if (!selection.blockId) return { section: section.label };
  const block = section.blocks.find((item) => item.id === selection.blockId);
  return { section: section.label, block: block?.label || "Bloco" };
}
