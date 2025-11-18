import { useState } from 'react';
import { Check, ChevronDown, Plus, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
export function StoreSelector() {
  const {
    currentStore,
    stores,
    switchStore,
    createStore
  } = useStore();
  const [open, setOpen] = useState(false);
  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      free: 'Free',
      grow: 'Grow',
      business: 'Business',
      enterprise: 'Enterprise'
    };
    return plans[plan] || 'Free';
  };
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full max-w-[280px] lg:max-w-[200px] justify-between px-3">
          <div className="flex items-center gap-2 truncate">
            <StoreIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {currentStore?.name || 'Selecionar Loja'}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] sm:w-[280px] p-0">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            Lojas
          </div>
          {stores.length === 0 ? <div className="text-sm text-muted-foreground text-center py-4">
              Nenhuma loja encontrada
            </div> : <div className="space-y-1">
              {stores.map(store => <button key={store.id} onClick={() => {
            switchStore(store.id);
            setOpen(false);
          }} className={cn('w-full flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors', currentStore?.id === store.id && 'bg-accent')}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <StoreIcon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium truncate w-full">
                        {store.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {getPlanName(store.plan)}
                        </Badge>
                        {store.is_published && <Badge variant="outline" className="text-xs">
                            Publicado
                          </Badge>}
                      </div>
                    </div>
                  </div>
                  {currentStore?.id === store.id && <Check className="h-4 w-4 flex-shrink-0" />}
                </button>)}
            </div>}
          <div className="border-t mt-2 pt-2">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
            createStore();
            setOpen(false);
          }}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Loja
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>;
}