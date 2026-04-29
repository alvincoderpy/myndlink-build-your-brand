import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Expand,
  Loader2,
  Monitor,
  Redo,
  Save,
  Search,
  Settings2,
  Smartphone,
  Undo,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ConfigPanel } from "@/components/store-editor/ConfigPanel";
import { EditorEmptyState } from "@/components/store-editor/EditorEmptyState";
import { EditorSidebar } from "@/components/store-editor/EditorSidebar";
import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  applyEditorTreeAction,
  buildEditorTree,
  getSelectionLabel,
  getSupportedSections,
  getTemplateName,
  getTemplateOptions,
  migrateConfigToTemplate,
} from "@/lib/editorTemplate";
import { getTemplateDefaults, templates } from "@/config/templates";
import { useAuth } from "@/contexts/useAuth";
import { useStore } from "@/contexts/useStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useHistory } from "@/hooks/useHistory";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/handleSupabaseError";
import { cn } from "@/lib/utils";
import type { EditorSelection, EditorTreeAction } from "@/types/editor";
import type { Store } from "@/types/store";
import type { TemplateConfig, TemplateId } from "@/types/template";

if (import.meta.env.DEV) {
  console.debug("[StoreEditor module] loaded");
}

type ViewMode = "desktop" | "mobile";
type SaveState = "unsaved" | "saving" | "saved";

const EMPTY_SELECTION: EditorSelection = {
  type: "section",
  sectionId: "branding",
};

const StoreEditor = () => {
  if (import.meta.env.DEV) {
    console.debug("[StoreEditor render]");
  }

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createStore, refreshStores } = useStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [store, setStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeSection, setActiveSection] = useState("branding");
  const [selection, setSelection] = useState<EditorSelection | null>(EMPTY_SELECTION);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfigHydrated, setIsConfigHydrated] = useState(false);
  const [inspectorEnabled, setInspectorEnabled] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isWideEditor, setIsWideEditor] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1600 : true,
  );

  const lastSavedSnapshotRef = useRef<string>("");

  const initialTemplateConfig = useMemo(() => getTemplateDefaults("minimog"), []);
  const {
    state: config,
    setState: setConfig,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<TemplateConfig>(initialTemplateConfig);

  const debouncedConfig = useDebounce(config, 1200);

  const tree = useMemo(() => {
    try {
      return buildEditorTree(config, store?.template ?? "minimog");
    } catch (error: unknown) {
      console.debug("[StoreEditor] buildEditorTree error", error);
      try {
        return buildEditorTree(
          getTemplateDefaults(store?.template ?? "minimog"),
          store?.template ?? "minimog",
        );
      } catch (fallbackError: unknown) {
        console.debug("[StoreEditor] buildEditorTree fallback error", fallbackError);
        return [];
      }
    }
  }, [config, store?.template]);
  const supportedSections = useMemo(
    () => getSupportedSections(store?.template ?? "minimog"),
    [store?.template],
  );

  const breadcrumb = useMemo(
    () => getSelectionLabel(tree, selection),
    [selection, tree],
  );

  const currentTemplateName = getTemplateName(store?.template || "minimog");

  useEffect(() => {
    const onResize = () => setIsWideEditor(window.innerWidth >= 1600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const serializeConfig = useCallback((value: TemplateConfig) => JSON.stringify(value), []);

  const loadStore = useCallback(async () => {
    const startedAt = Date.now();
    console.debug("[StoreEditor] loadStore:start", {
      userId: user?.id ?? null,
      startedAt,
    });

    if (!user) {
      setStore(null);
      setIsConfigHydrated(true);
      setLoading(false);
      console.debug("[StoreEditor] loadStore:no-user", {
        elapsedMs: Date.now() - startedAt,
      });
      return;
    }

    setIsConfigHydrated(false);
    setLoading(true);
    console.debug("[StoreEditor] loadStore:query:start");

    try {
      const { data: stores, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      console.debug("[StoreEditor] loadStore:query:result", {
        count: stores?.length ?? 0,
        error: error?.message ?? null,
        elapsedMs: Date.now() - startedAt,
      });

      if (error) {
        handleSupabaseError(error, t("editor.loadError"));
        setStore(null);
        setIsConfigHydrated(true);
        return;
      }

      if (stores && stores.length > 0) {
        const currentStore = stores[0] as Store;
        console.debug("[StoreEditor] loadStore:setStore", {
          storeId: currentStore.id,
          template: currentStore.template,
        });
        setStore(currentStore);
        setStoreName(currentStore.name || "");
        setSubdomain(currentStore.subdomain || "");

        const selectedConfig =
          currentStore.template_config ??
          getTemplateDefaults(currentStore.template ?? "minimog");

        console.debug("[StoreEditor] loadStore:setConfig", {
          hasTemplateConfig: Boolean(currentStore.template_config),
        });
        setConfig(selectedConfig);
        lastSavedSnapshotRef.current = serializeConfig(selectedConfig);
        setSaveState("saved");
        setIsConfigHydrated(true);
        console.debug("[StoreEditor] loadStore:hydrated:true", {
          storeId: currentStore.id,
        });
      } else {
        setStore(null);
        setIsConfigHydrated(true);
        setSaveState("saved");
        setConfig(getTemplateDefaults("minimog"));
        console.debug("[StoreEditor] loadStore:no-stores", {
          elapsedMs: Date.now() - startedAt,
        });
      }
    } catch (error: unknown) {
      console.debug("[StoreEditor] loadStore:catch", error);
      handleSupabaseError(error, t("editor.loadError"));
      setStore(null);
      setIsConfigHydrated(true);
    } finally {
      setLoading(false);
      console.debug("[StoreEditor] loadStore:finally:setLoading(false)", {
        elapsedMs: Date.now() - startedAt,
      });
    }
  }, [serializeConfig, setConfig, t, user]);

  const persistStoreConfig = useCallback(
    async (configToSave: TemplateConfig, options?: { manual?: boolean }) => {
      if (!store?.id) return;
      if (options?.manual) setSaving(true);
      setSaveState("saving");

      try {
        const { error } = await supabase
          .from("stores")
          .update({
            name: storeName,
            subdomain,
            template: store.template,
            template_config: configToSave,
          })
          .eq("id", store.id);

        if (error) {
          handleSupabaseError(error, t("editor.saveError"));
          setSaveState("unsaved");
          return;
        }

        lastSavedSnapshotRef.current = serializeConfig(configToSave);
        setSaveState("saved");

        if (options?.manual) {
          toast.success(t("editor.saveSuccess"));
          await refreshStores();
        }
      } catch (error: unknown) {
        handleSupabaseError(error, t("editor.saveError"));
        setSaveState("unsaved");
      } finally {
        if (options?.manual) setSaving(false);
      }
    },
    [refreshStores, serializeConfig, store, storeName, subdomain, t],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;

    if (store?.id) {
      await persistStoreConfig(config, { manual: true });
      return;
    }

    setSaving(true);
    setSaveState("saving");

    try {
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
      if (!subdomainRegex.test(subdomain)) {
        toast.error(t("editor.subdomainInvalid"));
        setSaveState("unsaved");
        return;
      }

      const { data: newStore, error } = await supabase
        .from("stores")
        .insert({
          user_id: user.id,
          name: storeName,
          subdomain,
          template: "minimog",
          template_config: config,
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, t("editor.saveError"));
        setSaveState("unsaved");
        return;
      }

      setStore(newStore as Store);

      if (newStore) {
        const template = templates[newStore.template as keyof typeof templates];
        if (template?.mockProducts) {
          const mockProductsToInsert = template.mockProducts.map((product, index) => ({
            store_id: newStore.id,
            ...product,
            is_mock: true,
            display_order: index + 1,
          }));
          const { error: productsError } = await supabase
            .from("products")
            .insert(mockProductsToInsert);
          if (productsError) {
            handleSupabaseError(productsError, t("editor.mockProductsError"));
          }
        }
      }

      toast.success(t("editor.createSuccess"));
      await loadStore();
    } catch (error: unknown) {
      handleSupabaseError(error, t("editor.saveError"));
      setSaveState("unsaved");
    } finally {
      setSaving(false);
    }
  }, [config, loadStore, persistStoreConfig, store?.id, storeName, subdomain, t, user]);

  const applyTemplate = useCallback(
    async (templateId: TemplateId) => {
      let migrated;
      try {
        migrated = migrateConfigToTemplate(config, templateId);
      } catch (error: unknown) {
        console.debug("[StoreEditor] migrateConfigToTemplate error", error);
        toast.error("Erro ao migrar template. A usar defaults.");
        migrated = { config: getTemplateDefaults(templateId), changed: true };
      }
      setConfig(migrated.config);
      setStore((prev) => (prev ? { ...prev, template: templateId } : prev));
      setSelection({ type: "section", sectionId: "branding" });
      setActiveSection("branding");

      if (!store?.id) {
        setSaveState("unsaved");
        return;
      }

      setSaveState("saving");
      const { error } = await supabase
        .from("stores")
        .update({
          template: templateId,
          template_config: migrated.config,
        })
        .eq("id", store.id);

      if (error) {
        handleSupabaseError(error, "Erro ao aplicar template");
        setSaveState("unsaved");
        return;
      }

      lastSavedSnapshotRef.current = serializeConfig(migrated.config);
      setSaveState("saved");
      await refreshStores();
      toast.success("Template aplicado no editor");
    },
    [config, refreshStores, serializeConfig, setConfig, store?.id],
  );

  const handleTreeAction = useCallback(
    (payload: EditorTreeAction) => {
      const nextConfig = applyEditorTreeAction(config, payload);
      setConfig(nextConfig);
      setSaveState("unsaved");

      if (payload.blockId) {
        setSelection({
          type: "block",
          sectionId: payload.sectionId,
          blockId: payload.blockId,
        });
      } else {
        setSelection({ type: "section", sectionId: payload.sectionId });
        setActiveSection(payload.sectionId);
      }
    },
    [config, setConfig],
  );

  const handleSelection = useCallback((nextSelection: EditorSelection) => {
    setSelection(nextSelection);
    setActiveSection(nextSelection.sectionId);
  }, []);

  useEffect(() => {
    console.debug("[StoreEditor] effect:loadStore", {
      userId: user?.id ?? null,
    });
    void loadStore();
  }, [loadStore, user?.id]);

  useEffect(() => {
    console.debug("[StoreEditor] effect:save-state-check", {
      isConfigHydrated,
      hasStore: Boolean(store?.id),
    });
    if (!isConfigHydrated) return;
    const current = serializeConfig(config);
    if (current !== lastSavedSnapshotRef.current && saveState !== "saving") {
      setSaveState("unsaved");
    }
  }, [config, isConfigHydrated, saveState, serializeConfig, store?.id]);

  useEffect(() => {
    console.debug("[StoreEditor] effect:autosave", {
      isConfigHydrated,
      hasStore: Boolean(store?.id),
    });
    if (!isConfigHydrated || !store?.id || !debouncedConfig) return;

    const current = serializeConfig(debouncedConfig);
    if (current === lastSavedSnapshotRef.current) return;

    void persistStoreConfig(debouncedConfig);
  }, [debouncedConfig, isConfigHydrated, persistStoreConfig, serializeConfig, store?.id]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        void handleSave();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleSave, redo, undo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="h-screen bg-background">
        <EditorEmptyState
          onCreateStore={() => {
            createStore();
          }}
          onOpenTemplates={() => {
            navigate("/dashboard/templates");
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <div className="border-b bg-background px-4 py-2 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/store")}
            className="h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">{t("editor.back")}</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground truncate">
            <span>Template</span>
            <span>{">"}</span>
            <span className="text-foreground">{currentTemplateName}</span>
            <span>{">"}</span>
            <span className="text-foreground">{breadcrumb.section}</span>
            {breadcrumb.block ? (
              <>
                <span>{">"}</span>
                <span className="text-foreground">{breadcrumb.block}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Select
            value={(store?.template || "minimog") as string}
            onValueChange={(nextTemplate) => {
              void applyTemplate(nextTemplate);
            }}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getTemplateOptions().map((templateOption) => (
                <SelectItem key={templateOption.id} value={templateOption.id}>
                  {templateOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-md border p-0.5 gap-0.5">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={isPreviewFullscreen ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsPreviewFullscreen((prev) => !prev)}
            >
              <Expand className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant={inspectorEnabled ? "secondary" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => setInspectorEnabled((prev) => !prev)}
          >
            <Search className="w-4 h-4 mr-1" />
            Preview inspector
          </Button>

          {!isWideEditor ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              Settings
            </Button>
          ) : null}

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={undo} disabled={!canUndo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={redo} disabled={!canRedo}>
            <Redo className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-[78px]">
            {saveState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {saveState === "saved" ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            {saveState === "unsaved" ? "Unsaved" : saveState === "saving" ? "Saving" : "Saved"}
          </span>

          <Button size="sm" onClick={() => void handleSave()} disabled={saving} className="h-8">
            <Save className="w-4 h-4 mr-1" />
            {saving ? t("editor.saving") : t("editor.save")}
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="h-8 w-[138px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="branding">{t("editor.branding")}</SelectItem>
              <SelectItem value="topbar">{t("editor.topbar")}</SelectItem>
              <SelectItem value="hero">{t("editor.hero")}</SelectItem>
              <SelectItem value="categories">{t("editor.categories")}</SelectItem>
              <SelectItem value="products">Produtos</SelectItem>
              <SelectItem value="templates">Templates</SelectItem>
              <SelectItem value="settings">{t("editor.settings")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPreview((prev) => !prev)}
            className="h-8"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => void handleSave()} disabled={saving} className="h-8">
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r bg-background flex-shrink-0 hidden lg:block overflow-y-auto">
          <EditorSidebar
            tree={tree}
            selection={selection}
            onSelect={handleSelection}
            onAction={handleTreeAction}
          />
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col bg-muted/20 overflow-hidden",
            showPreview ? "block" : "hidden md:flex",
            isPreviewFullscreen && "fixed inset-0 z-50 bg-background p-4",
          )}
        >
          <div className="flex-1 overflow-auto">
            <StorefrontPreview
              config={config}
              storeName={storeName || t("editor.myStore")}
              storeId={store?.id}
              viewMode={viewMode}
              activeSection={activeSection}
              inspectorEnabled={inspectorEnabled}
              selectedNode={selection}
              onSelectNode={handleSelection}
              supportedSections={supportedSections}
            />
          </div>
        </div>

        {isWideEditor ? (
          <div className="w-[360px] border-l bg-background overflow-y-auto flex-shrink-0">
            <ConfigPanel
              activeSection={activeSection}
              selection={selection}
              config={config}
              onChange={setConfig}
              storeId={store?.id}
              templateId={store?.template || "minimog"}
              storeName={storeName}
              subdomain={subdomain}
              onStoreNameChange={setStoreName}
              onSubdomainChange={setSubdomain}
              store={store}
              onStoreUpdate={loadStore}
              onApplyTemplate={applyTemplate}
            />
          </div>
        ) : null}
      </div>

      <Sheet open={settingsOpen && !isWideEditor} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>Configuracoes do editor</SheetTitle>
            <SheetDescription>
              Ajuste secoes e blocos com base no item selecionado.
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-84px)]">
            <ConfigPanel
              activeSection={activeSection}
              selection={selection}
              config={config}
              onChange={setConfig}
              storeId={store?.id}
              templateId={store?.template || "minimog"}
              storeName={storeName}
              subdomain={subdomain}
              onStoreNameChange={setStoreName}
              onSubdomainChange={setSubdomain}
              store={store}
              onStoreUpdate={loadStore}
              onApplyTemplate={applyTemplate}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StoreEditor;
