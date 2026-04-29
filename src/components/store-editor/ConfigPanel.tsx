import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getTemplateDefaults,
  templateList,
} from "@/config/templates";
import { supabase } from "@/integrations/supabase/client";
import { getSupportedSections, getTemplateOptions } from "@/lib/editorTemplate";
import { getErrorMessage } from "@/lib/handleSupabaseError";
import type { EditorSelection, EditorSectionId } from "@/types/editor";
import type { Store } from "@/types/store";
import type { TemplateConfig, TemplateId } from "@/types/template";

import { BrandingConfig } from "./BrandingConfig";
import { CategoriesConfig } from "./CategoriesConfig";
import { HeroConfig } from "./HeroConfig";
import { StorefrontPreview } from "./StorefrontPreview";
import { TopBarConfig } from "./TopBarConfig";

interface ConfigPanelProps {
  activeSection: string;
  selection: EditorSelection | null;
  config: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
  storeId?: string;
  templateId?: string;
  storeName: string;
  subdomain: string;
  onStoreNameChange: (name: string) => void;
  onSubdomainChange: (subdomain: string) => void;
  store: Store | null;
  onStoreUpdate: () => void;
  onApplyTemplate: (templateId: TemplateId) => Promise<void>;
}

function parseBlockIndex(blockId?: string): number {
  if (!blockId) return -1;
  const raw = Number(blockId.split(":")[1]);
  return Number.isFinite(raw) ? raw : -1;
}

export function ConfigPanel({
  activeSection,
  selection,
  config,
  onChange,
  storeId,
  templateId,
  storeName,
  subdomain,
  onStoreNameChange,
  onSubdomainChange,
  store,
  onStoreUpdate,
  onApplyTemplate,
}: ConfigPanelProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId | null>(null);
  const [confirmTemplateId, setConfirmTemplateId] = useState<TemplateId | null>(null);
  const [applyingTemplateId, setApplyingTemplateId] = useState<TemplateId | null>(null);

  const contextualSection =
    (selection?.sectionId as EditorSectionId | undefined) ??
    (activeSection as EditorSectionId);

  const handlePublishToggle = async (checked: boolean) => {
    if (!storeId) {
      toast.error("Por favor, guarde a loja primeiro");
      return;
    }

    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_published: checked })
        .eq("id", storeId);

      if (error) throw error;

      toast.success(checked ? "Loja publicada com sucesso!" : "Loja despublicada");
      onStoreUpdate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao atualizar estado de publicacao"));
    }
  };

  const handleApplyTemplate = async (nextTemplateId: TemplateId) => {
    setApplyingTemplateId(nextTemplateId);
    try {
      await onApplyTemplate(nextTemplateId);
      setConfirmTemplateId(null);
      setPreviewTemplateId(null);
    } finally {
      setApplyingTemplateId(null);
    }
  };

  const updateBlockLabel = (value: string) => {
    if (!selection || selection.type !== "block") return;
    const index = parseBlockIndex(selection.blockId);
    if (index < 0) return;

    if (selection.sectionId === "categories" && Array.isArray(config.categories)) {
      const next = [...config.categories];
      if (!next[index]) return;
      next[index] = { ...next[index], name: value };
      onChange({ ...config, categories: next });
    }

    if (selection.sectionId === "products" && config.productTabs?.tabs) {
      const tabs = [...config.productTabs.tabs];
      if (!tabs[index]) return;
      tabs[index] = { ...tabs[index], label: value };
      onChange({
        ...config,
        productTabs: { ...config.productTabs, tabs },
      });
    }
  };

  const selectedBlockLabel = (() => {
    if (!selection || selection.type !== "block") return "";
    const index = parseBlockIndex(selection.blockId);
    if (index < 0) return "";
    if (selection.sectionId === "categories" && Array.isArray(config.categories)) {
      return config.categories[index]?.name ?? "";
    }
    if (selection.sectionId === "products" && config.productTabs?.tabs) {
      return config.productTabs.tabs[index]?.label ?? "";
    }
    return "";
  })();

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {(contextualSection === "branding" || activeSection === "branding") && (
            <div>
              <h3 className="font-semibold mb-4">Marca</h3>
              <BrandingConfig config={config} onChange={onChange} storeId={storeId} />
            </div>
          )}

          {(contextualSection === "topbar" || activeSection === "topbar") && (
            <div className="space-y-4">
              <h3 className="font-semibold">Barra superior</h3>
              <TopBarConfig config={config} onChange={onChange} />
              {config.topBar?.showSocial ? (
                <p className="text-xs text-muted-foreground">
                  Links sociais estao ativos nesta secao.
                </p>
              ) : null}
            </div>
          )}

          {(contextualSection === "hero" || activeSection === "hero") && (
            <div className="space-y-4">
              <h3 className="font-semibold">Banner principal</h3>
              <HeroConfig config={config} onChange={onChange} storeId={storeId} />
              {config.hero?.showPromo ? (
                <p className="text-xs text-muted-foreground">
                  O texto promocional esta visivel no hero.
                </p>
              ) : null}
            </div>
          )}

          {(contextualSection === "categories" || activeSection === "categories") && (
            <div>
              <h3 className="font-semibold mb-4">Categorias</h3>
              <CategoriesConfig config={config} onChange={onChange} storeId={storeId} />
            </div>
          )}

          {(contextualSection === "products" || activeSection === "products") &&
          activeSection !== "templates" ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Produtos</h3>
              <div className="space-y-2">
                <Label htmlFor="productsTitle">Titulo da secao</Label>
                <Input
                  id="productsTitle"
                  value={config.productTabs?.title || ""}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      productTabs: {
                        ...(config.productTabs ?? { enabled: true, tabs: [] }),
                        title: event.target.value,
                      },
                    })
                  }
                />
              </div>
              {config.productTabs?.enabled === false ? (
                <p className="text-xs text-muted-foreground">
                  Esta secao esta oculta e pode ser reativada na arvore.
                </p>
              ) : null}
            </div>
          ) : null}

          {activeSection === "templates" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Templates</h3>
              <p className="text-xs text-muted-foreground">
                Troque de template sem sair do editor. Campos em comum sao preservados.
              </p>
              <div className="grid gap-3">
                {templateList.map((template) => {
                  const isActive = (templateId || store?.template) === template.id;
                  const isApplying = applyingTemplateId === template.id;

                  return (
                    <Card key={template.id} className="border-border/70">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between gap-2">
                          <span>{template.name}</span>
                          {isActive ? <Badge variant="secondary">Ativo</Badge> : null}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setPreviewTemplateId(template.id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={() => setConfirmTemplateId(template.id)}
                          disabled={isApplying}
                        >
                          {isApplying ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                          Aplicar
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {selection?.type === "block" ? (
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Config do bloco selecionado</h4>
              <div className="space-y-2">
                <Label htmlFor="blockLabel">Rotulo</Label>
                <Input
                  id="blockLabel"
                  value={selectedBlockLabel}
                  onChange={(event) => updateBlockLabel(event.target.value)}
                  placeholder="Nome do bloco"
                />
              </div>
            </div>
          ) : null}

          {activeSection === "settings" ? (
            <div className="space-y-6">
              <h3 className="font-semibold mb-4">Configuracoes</h3>

              <div>
                <Label>Template</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Escolha um template base para sua loja
                </p>
                <Select
                  value={store?.template || "minimog"}
                  onValueChange={async (nextTemplateId) => {
                    await handleApplyTemplate(nextTemplateId);
                  }}
                >
                  <SelectTrigger>
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
              </div>

              <div>
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => onStoreNameChange(e.target.value)}
                  placeholder="Minha Loja"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Subdominio</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => onSubdomainChange(e.target.value.toLowerCase())}
                    placeholder="minhaloja"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.myndlink.com</span>
                </div>
              </div>

              {storeId ? (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label className="text-base font-semibold">Publicar Loja</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Torna a loja visivel publicamente
                    </p>
                  </div>
                  <Switch checked={store?.is_published || false} onCheckedChange={handlePublishToggle} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <Dialog
        open={Boolean(previewTemplateId)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplateId(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          {previewTemplateId ? (
            <>
              <DialogHeader>
                <DialogTitle>Preview do template</DialogTitle>
                <DialogDescription>Visualizacao real do layout antes de aplicar.</DialogDescription>
              </DialogHeader>
              <div className="h-[70vh] overflow-hidden rounded-md border">
                <StorefrontPreview
                  config={getTemplateDefaults(previewTemplateId)}
                  storeName={storeName || "Minha Loja"}
                  viewMode="desktop"
                  activeSection="branding"
                  supportedSections={getSupportedSections(previewTemplateId)}
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(confirmTemplateId)}
        onOpenChange={(open) => {
          if (!open) setConfirmTemplateId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar template</AlertDialogTitle>
            <AlertDialogDescription>
              Aplicar este template vai substituir o design atual da loja. Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (confirmTemplateId) {
                  void handleApplyTemplate(confirmTemplateId);
                }
              }}
            >
              {confirmTemplateId && applyingTemplateId === confirmTemplateId ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : null}
              Aplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
