import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { templates, TemplateConfig } from "@/config/templates";

interface StorePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  currentConfig: TemplateConfig;
}

export function StorePreviewModal({ open, onOpenChange, storeName, currentConfig }: StorePreviewModalProps) {
  const renderPreview = (config: TemplateConfig, isComparison = false) => (
    <div 
      className="rounded-lg overflow-hidden border-2 border-border h-full"
      style={{ backgroundColor: `hsl(${config.colors.secondary})` }}
    >
      <div className="p-6">
        <h3 
          className={`text-xl mb-4 ${config.fonts.heading}`}
          style={{ color: `hsl(${config.colors.primary})` }}
        >
          {storeName || "Minha Loja"}
        </h3>
        <div 
          className={`grid gap-3 ${
            config.layout === 'list' 
              ? 'grid-cols-1' 
              : config.layout === 'masonry'
              ? 'grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
          }`}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
              <div 
                className={`${config.layout === 'list' ? 'aspect-video' : 'aspect-square'}`}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pré-visualização da Loja</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Atual</TabsTrigger>
            <TabsTrigger value="fashion">Moda</TabsTrigger>
            <TabsTrigger value="electronics">Eletrônicos</TabsTrigger>
            <TabsTrigger value="beauty">Beleza</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="h-[600px]">
            {renderPreview(currentConfig)}
          </TabsContent>
          
          <TabsContent value="fashion" className="h-[600px]">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <h4 className="text-sm font-semibold mb-2">Template Moda</h4>
                {renderPreview(templates.fashion, true)}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Sua Configuração</h4>
                {renderPreview(currentConfig, true)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="electronics" className="h-[600px]">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <h4 className="text-sm font-semibold mb-2">Template Eletrônicos</h4>
                {renderPreview(templates.electronics, true)}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Sua Configuração</h4>
                {renderPreview(currentConfig, true)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="beauty" className="h-[600px]">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <h4 className="text-sm font-semibold mb-2">Template Beleza</h4>
                {renderPreview(templates.beauty, true)}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Sua Configuração</h4>
                {renderPreview(currentConfig, true)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
