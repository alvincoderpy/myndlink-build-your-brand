import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Palette,
  LayoutTemplate,
  Image as ImageIcon,
  Grid3x3,
  Settings,
} from "lucide-react";

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sections: Section[] = [
  {
    id: "branding",
    label: "Marca",
    icon: <Palette className="w-5 h-5" />,
    description: "Logo e cores da loja",
  },
  {
    id: "topbar",
    label: "Barra Superior",
    icon: <LayoutTemplate className="w-5 h-5" />,
    description: "Anúncios e mensagens",
  },
  {
    id: "hero",
    label: "Banner Principal",
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Imagem de destaque e título",
  },
  {
    id: "categories",
    label: "Categorias",
    icon: <Grid3x3 className="w-5 h-5" />,
    description: "Grid de categorias",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
    description: "Nome, domínio e publicação",
  },
];

interface EditorSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function EditorSidebar({ activeSection, onSectionChange }: EditorSidebarProps) {
  return (
    <div className="w-72 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Personalizar Loja</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Clica numa seção para editar
        </p>
      </div>

      {/* Sections List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-auto py-3 px-3",
                activeSection === section.id && "bg-secondary"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">{section.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {section.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
