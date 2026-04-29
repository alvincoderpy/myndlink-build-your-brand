import { LayoutTemplate, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditorEmptyStateProps {
  onCreateStore: () => void;
  onOpenTemplates: () => void;
}

export function EditorEmptyState({
  onCreateStore,
  onOpenTemplates,
}: EditorEmptyStateProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Ainda nao existe loja para editar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Crie uma loja primeiro ou escolha um template inicial para comecar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateStore}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar loja
            </Button>
            <Button variant="outline" onClick={onOpenTemplates}>
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Abrir templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
