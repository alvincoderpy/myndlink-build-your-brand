import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { templates, TemplateConfig } from "@/config/templates";

interface StorePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  currentConfig: TemplateConfig;
}

const getTemplateDescription = (templateKey: string): string => {
  const descriptions: Record<string, string> = {
    prestige: "Ideal para joias, relógios, moda de luxo. Tipografia elegante e espaçamento generoso.",
    empire: "Perfeito para marcas fashion com fotografia forte. Layout bold e minimalista.",
    atelier: "Sofisticado para arte, design, produtos artesanais. Tons naturais e suaves.",
    dawn: "Versátil e moderno. Ótimo para qualquer nicho. Alta performance.",
    minimal: "Ultra-clean. Ideal para produtos tecnológicos ou design minimalista.",
    impulse: "Fashion-forward. Cores vibrantes, ideal para roupas e acessórios jovens.",
    vogue: "Editorial luxury. Para marcas premium que valorizam storytelling.",
    vertex: "Futurista e tech. Perfeito para gadgets, eletrônicos, software.",
    fashion: "Template clássico - Moda elegante",
    electronics: "Template clássico - Tech básico",
    beauty: "Template clássico - Beleza suave"
  };
  return descriptions[templateKey] || "Template personalizado";
};

export function StorePreviewModal({ open, onOpenChange, storeName, currentConfig }: StorePreviewModalProps) {
  const renderPreview = (config: TemplateConfig, templateKey?: string) => (
    <div 
      className="rounded-lg overflow-hidden border-2 border-border h-full"
      style={{ backgroundColor: `hsl(${config.colors.secondary})` }}
    >
      {templateKey && (
        <div className="p-4 border-b border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">{getTemplateDescription(templateKey)}</p>
        </div>
      )}
      <div className="p-6">
        <h3 
          className={`text-xl mb-4 ${config.fonts.heading}`}
          style={{ color: `hsl(${config.colors.primary})` }}
        >
          {storeName || "Minha Loja"}
        </h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
              <div 
                className="aspect-square"
                style={{ backgroundColor: `hsl(${config.colors.accent})` }}
              />
              <div className={`p-3 ${config.fonts.body}`}>
                <p className="font-bold text-sm mb-1">Produto {i}</p>
                <p className="text-xs opacity-70 mb-1">Descrição</p>
                <p className="font-bold text-sm" style={{ color: `hsl(${config.colors.primary})` }}>
                  99.99 MT
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const templateKeys = Object.keys(templates);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pré-visualização da Loja</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="current" className="w-full flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="current">Atual</TabsTrigger>
              <TabsTrigger value="minimog">Minimog Fashion</TabsTrigger>
            </TabsList>
          </ScrollArea>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="current" className="h-[600px] m-0">
              {renderPreview(currentConfig)}
            </TabsContent>
            
            {templateKeys.map((key) => (
              <TabsContent key={key} value={key} className="h-[600px] m-0">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Template {templates[key].name}</h4>
                    {renderPreview(templates[key], key)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Sua Configuração</h4>
                    {renderPreview(currentConfig)}
                  </div>
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
