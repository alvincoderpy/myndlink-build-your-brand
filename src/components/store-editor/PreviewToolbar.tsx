import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PreviewToolbarProps {
  viewMode: "desktop" | "tablet" | "mobile";
  onViewModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
}

export function PreviewToolbar({ viewMode, onViewModeChange }: PreviewToolbarProps) {
  return (
    <motion.div 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-2 p-3 border-b bg-muted/30"
    >
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
        <Button
          variant={viewMode === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("desktop")}
          className={cn(
            "h-8 px-3 transition-all duration-200",
            viewMode === "desktop" && "scale-105"
          )}
        >
          <Monitor className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === "tablet" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("tablet")}
          className={cn(
            "h-8 px-3 transition-all duration-200",
            viewMode === "tablet" && "scale-105"
          )}
        >
          <Tablet className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("mobile")}
          className={cn(
            "h-8 px-3 transition-all duration-200",
            viewMode === "mobile" && "scale-105"
          )}
        >
          <Smartphone className="w-4 h-4" />
        </Button>
      </div>
      
      <motion.div 
        key={viewMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 text-center text-sm text-muted-foreground"
      >
        Pré-visualização em {viewMode === "desktop" ? "Desktop" : viewMode === "tablet" ? "Tablet" : "Mobile"}
      </motion.div>
    </motion.div>
  );
}
