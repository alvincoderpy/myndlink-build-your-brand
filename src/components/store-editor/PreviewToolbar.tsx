import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewToolbarProps {
  viewMode: "desktop" | "tablet" | "mobile";
  onViewModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
}

export function PreviewToolbar({ viewMode, onViewModeChange }: PreviewToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
        <Button
          variant={viewMode === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("desktop")}
          className={cn("h-8 px-3")}
        >
          <Monitor className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === "tablet" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("tablet")}
          className={cn("h-8 px-3")}
        >
          <Tablet className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("mobile")}
          className={cn("h-8 px-3")}
        >
          <Smartphone className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 text-center text-sm text-muted-foreground">
        Pré-visualização em {viewMode === "desktop" ? "Desktop" : viewMode === "tablet" ? "Tablet" : "Mobile"}
      </div>
    </div>
  );
}
