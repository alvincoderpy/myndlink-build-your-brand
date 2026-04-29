import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, LayoutTemplate, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { StorefrontPreview } from "@/components/store-editor/StorefrontPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { templatesById, templateList } from "@/config/templates";
import { useStore } from "@/contexts/useStore";
import { supabase } from "@/integrations/supabase/client";
import type { TemplateId } from "@/types/template";

const defaultHighlights = ["Cores neutras", "Hero pronto", "Topbar configurada"];

export default function Templates() {
  const navigate = useNavigate();
  const { currentStore, refreshStores, createStore } = useStore();

  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId | null>(null);
  const [confirmTemplateId, setConfirmTemplateId] = useState<TemplateId | null>(null);
  const [applyingId, setApplyingId] = useState<TemplateId | null>(null);

  const previewTemplate = useMemo(
    () => (previewTemplateId ? templatesById[previewTemplateId] : null),
    [previewTemplateId],
  );

  const applyTemplate = useCallback(
    async (templateId: TemplateId) => {
      const templateMeta = templatesById[templateId];
      if (!templateMeta) {
        toast.error("Template invalido.");
        return;
      }
      if (!currentStore) {
        toast.error("Crie uma loja para aplicar um template.");
        return;
      }

      setApplyingId(templateId);

      const { error } = await supabase
        .from("stores")
        .update({
          template: templateId,
          template_config: templateMeta.defaults,
        })
        .eq("id", currentStore.id);

      if (error) {
        setApplyingId(null);
        toast.error("Nao foi possivel aplicar o template.");
        return;
      }

      await refreshStores();
      setApplyingId(null);
      setConfirmTemplateId(null);
      setPreviewTemplateId(null);
      toast.success("Template aplicado com sucesso.");
      navigate("/dashboard/store/edit");
    },
    [currentStore, navigate, refreshStores],
  );

  if (!currentStore) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            Crie uma loja para comecar a aplicar templates.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={createStore}>Criar loja</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Escolhe um design inicial para a tua loja e personaliza no editor.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templateList.map((template) => {
          const isActive = currentStore.template === template.id;
          const isApplying = applyingId === template.id;

          return (
            <Card key={template.id} className="border-border/60 bg-card/70">
              <CardHeader className="space-y-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border/50 bg-muted">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <LayoutTemplate className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                  {isActive ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewTemplateId(template.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>

                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setConfirmTemplateId(template.id)}
                  disabled={isApplying}
                >
                  {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Aplicar
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplateId(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          {previewTemplate ? (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="h-[70vh] overflow-hidden rounded-lg border border-border/60 bg-muted">
                <StorefrontPreview
                  config={previewTemplate.defaults}
                  storeName={currentStore.name || "Minha Loja"}
                  viewMode="desktop"
                  activeSection="branding"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Highlights</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(previewTemplate.tags.length
                    ? previewTemplate.tags
                    : defaultHighlights
                  ).map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setConfirmTemplateId(previewTemplate.id)}>
                  Aplicar este template
                </Button>
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
              Aplicar este template vai substituir o design atual da tua loja. Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (confirmTemplateId) {
                  void applyTemplate(confirmTemplateId);
                }
              }}
              disabled={Boolean(confirmTemplateId && applyingId)}
            >
              {confirmTemplateId && applyingId === confirmTemplateId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Aplicar template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
