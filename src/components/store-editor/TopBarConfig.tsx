import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { hslToHex, hexToHsl } from "@/lib/colorUtils";
import type { TemplateConfig } from "@/types/template";

interface TopBarConfigProps {
  config: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
}

export function TopBarConfig({ config, onChange }: TopBarConfigProps) {
  const topBarConfig = config.topBar || {};

  const updateTopBar = (updates: Partial<NonNullable<TemplateConfig["topBar"]>>) => {
    onChange({
      ...config,
      topBar: {
        ...topBarConfig,
        ...updates,
      },
    });
  };

  const bgHex = hslToHex(topBarConfig.backgroundColor ?? "0 0% 0%");
  const textHex = hslToHex(topBarConfig.textColor ?? "0 0% 100%");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Mostrar Barra Superior</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Exibe uma barra com anúncios no topo da loja
          </p>
        </div>
        <Switch
          checked={topBarConfig.showAnnouncement !== false}
          onCheckedChange={(checked) => updateTopBar({ showAnnouncement: checked })}
        />
      </div>

      {topBarConfig.showAnnouncement !== false && (
        <>
          <div>
            <Label htmlFor="announcement">Mensagem de Anúncio</Label>
            <Input
              id="announcement"
              placeholder="Frete grátis em compras acima de 500 MT"
              value={topBarConfig.announcement || ""}
              onChange={(e) => updateTopBar({ announcement: e.target.value })}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta mensagem aparecerá na barra superior da loja
            </p>
          </div>

          <div>
            <Label htmlFor="topbar-bg">Cor de Fundo</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="topbar-bg"
                type="color"
                value={bgHex}
                onChange={(e) =>
                  updateTopBar({ backgroundColor: hexToHsl(e.target.value) })
                }
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={bgHex}
                onChange={(e) =>
                  updateTopBar({ backgroundColor: hexToHsl(e.target.value) })
                }
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="topbar-text">Cor do Texto</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="topbar-text"
                type="color"
                value={textHex}
                onChange={(e) =>
                  updateTopBar({ textColor: hexToHsl(e.target.value) })
                }
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={textHex}
                onChange={(e) =>
                  updateTopBar({ textColor: hexToHsl(e.target.value) })
                }
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

