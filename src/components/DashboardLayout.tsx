// DashboardLayout.tsx
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/useAuth";
import { useStore } from "@/contexts/useStore";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { OnboardingChecklist } from "./OnboardingChecklist";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { Bell, Check, ChevronDown, Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const { currentStore, stores, switchStore, createStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const storeLabel = currentStore?.name?.trim()
    ? currentStore.name
    : "Minha loja";

  return (
    <div className="min-h-screen w-full bg-muted/30">
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 h-14 bg-foreground text-background shadow-sm">
        <div className="mx-auto grid h-full w-full max-w-[1400px] grid-cols-[260px,1fr,260px] items-center px-4 lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2 font-semibold tracking-tight text-background">
            <span className="text-base">MyndLink</span>
          </div>

          {/* Search (centralizado) */}
          <div className="flex justify-center">
            <button
              type="button"
              className="hidden w-full max-w-xl lg:block"
              aria-label="Pesquisar"
              onClick={() => navigate("/dashboard/store/edit")}
            >
              <div className="relative w-full">
                <Input
                  placeholder="Pesquisar..."
                  className="h-9 w-full cursor-pointer bg-background/10 text-background placeholder:text-background/60 border-background/10 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0"
                  readOnly
                />
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-background/15 bg-background/10 px-2 py-0.5 text-xs text-background/70">
                  Ctrl K
                </div>
              </div>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-2">
            {/* Notificações */}
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md",
                "bg-background/10 hover:bg-background/15 transition-colors",
              )}
              aria-label="Notificações"
              onClick={() => navigate("/dashboard/settings")}
            >
              <Bell className="h-4 w-4 text-background/90" />
            </button>

            {/* Trocar loja */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium",
                    "bg-background/10 hover:bg-background/15 transition-colors",
                  )}
                  aria-label="Trocar loja"
                >
                  <span className="max-w-[180px] truncate">{storeLabel}</span>
                  <ChevronDown className="h-4 w-4 text-background/80" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Lojas
                </div>

                {stores?.length ? (
                  stores.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onSelect={() => switchStore(s.id)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{s.name || "Sem nome"}</span>
                      {currentStore?.id === s.id ? (
                        <Check className="h-4 w-4 text-foreground" />
                      ) : null}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Nenhuma loja</DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => createStore()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar nova loja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex w-full pt-14">
        <aside className="shrink-0">
          <DashboardSidebar />
        </aside>

        <main className="relative flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-5xl rounded-2xl bg-background p-6 shadow-sm overflow-hidden border border-border/60">
            {/*
              ✅ CORRIGIDO: Substituído o guia hardcoded (GUIDE_ITEMS com done: false estático)
                 pelo OnboardingChecklist real que lê progresso do Supabase.
                 O checklist só aparece enquanto o utilizador não completou o onboarding
                 e pode ser dispensado com localStorage.
            */}
            <OnboardingChecklist />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};



