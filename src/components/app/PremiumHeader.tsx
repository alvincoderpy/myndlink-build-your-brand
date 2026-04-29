import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/useAuth";
import { useStore } from "@/contexts/useStore";
import { cn } from "@/lib/utils";

function getInitials(email?: string | null) {
  if (!email) return "U";
  const [namePart] = email.split("@");
  const parts = namePart.split(/[._-]+/).filter(Boolean);
  const initials = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
  return initials.toUpperCase();
}

export type PremiumHeaderProps = React.HTMLAttributes<HTMLElement>;

export function PremiumHeader({ className, ...props }: PremiumHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentStore, stores, switchStore } = useStore();

  const storeLabel = currentStore?.name ?? "Minha loja";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-foreground px-4 text-background shadow-sm lg:px-6",
        className,
      )}
      {...props}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="text-sm font-semibold tracking-tight text-background">MyndLink</div>
      </div>

      {/* Middle */}
      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-background/70" />
          <Input
            placeholder="Pesquisar..."
            className="h-9 border-0 bg-background/10 pl-9 pr-16 text-background placeholder:text-background/60 focus-visible:ring-2 focus-visible:ring-background/30 focus-visible:ring-offset-0"
            aria-label="Pesquisar"
          />
          <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-background/20 bg-background/10 px-2 py-0.5 text-[10px] text-background/70 sm:inline-flex">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 max-w-[200px] justify-between gap-2 bg-background/10 text-background hover:bg-background/15 hover:text-background"
            >
              <span className="truncate">{storeLabel}</span>
              <ChevronDown className="h-4 w-4 text-background/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {stores.length ? (
              stores.map((store) => (
                <DropdownMenuItem
                  key={store.id}
                  onClick={() => switchStore(store.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{store.name}</span>
                  {currentStore?.id === store.id ? <Check className="h-4 w-4 text-muted-foreground" /> : null}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-muted-foreground">Nenhuma loja</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-background/10 text-background hover:bg-background/15 hover:text-background"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-background/15 text-background">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email ?? "Conta"}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Definições</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}



