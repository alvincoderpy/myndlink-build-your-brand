import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface TopBarConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export function TopBarConfig({ config, onChange }: TopBarConfigProps) {
  const topBarConfig = config.topBar || {};

  const updateTopBar = (updates: any) => {
    onChange({
      ...config,
      topBar: {
        ...topBarConfig,
        ...updates,
      },
    });
  };

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
      )}
    </div>
  );
}
