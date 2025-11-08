import { Instagram } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TopBarProps {
  config: {
    backgroundColor: string;
    textColor: string;
    socialProof: string;
    announcement: string;
    showLanguage: boolean;
    showCurrency: boolean;
  };
}

export function TopBar({ config }: TopBarProps) {
  return (
    <div 
      className="py-2 px-4 text-xs"
      style={{ 
        backgroundColor: `hsl(${config.backgroundColor})`,
        color: `hsl(${config.textColor})`
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Left: Social Proof */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Instagram className="w-3 h-3" />
            <span className="hidden sm:inline">{config.socialProof}</span>
          </span>
        </div>
        
        {/* Center: Announcement */}
        <div className="hidden md:block text-center flex-1 px-4">
          {config.announcement}
        </div>
        
        {/* Right: Language & Currency */}
        <div className="flex items-center gap-4">
          {config.showLanguage && (
            <Select defaultValue="pt">
              <SelectTrigger className="h-6 text-xs border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">PT</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
          )}
          {config.showCurrency && (
            <Select defaultValue="MZN">
              <SelectTrigger className="h-6 text-xs border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MZN">MZN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
