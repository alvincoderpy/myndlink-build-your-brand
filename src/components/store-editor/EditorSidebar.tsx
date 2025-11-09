import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Palette, 
  Megaphone, 
  Image, 
  FolderOpen, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  icon: JSX.Element;
}

const sections: Section[] = [
  {
    id: "branding",
    label: "Marca",
    icon: <Palette className="w-4 h-4" />,
  },
  {
    id: "topbar",
    label: "Barra Superior",
    icon: <Megaphone className="w-4 h-4" />,
  },
  {
    id: "hero",
    label: "Banner Principal",
    icon: <Image className="w-4 h-4" />,
  },
  {
    id: "categories",
    label: "Categorias",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <Settings className="w-4 h-4" />,
  },
];

interface EditorSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function EditorSidebar({ activeSection, onSectionChange }: EditorSidebarProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Seções</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-9 px-3 text-sm transition-all",
                activeSection === section.id && "bg-secondary font-medium"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              {section.icon}
              <span className="ml-2">{section.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
