// DashboardLayout.tsx
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/useAuth";
import { useStore } from "@/contexts/useStore";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { Bell, Check, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const { currentStore, stores, switchStore, createStore } = useStore();
  const navigate = useNavigate();

  // ✅ Guia (bottom-right)
  const [guideVisible, setGuideVisible] = useState(true);
  const [guideOpen, setGuideOpen] = useState(true);

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

  const GUIDE_ITEMS = [
    {
      label: "Fale sobre sua empresa",
      done: false,
      onClick: () => navigate("/dashboard/settings"),
    },
    {
      label: "Configurar pagamentos",
      done: false,
      onClick: () => navigate("/dashboard/settings"),
    },
    {
      label: "Configurar as faturas",
      done: false,
      onClick: () => navigate("/dashboard/invoices"),
    },
    {
      label: "Configurar subdomínio",
      done: false,
      onClick: () => navigate("/dashboard/settings"),
    },
    {
      label: "Verifique sua empresa",
      done: false,
      onClick: () => navigate("/dashboard/settings"),
    },
  ];

  const completed = GUIDE_ITEMS.filter((i) => i.done).length;

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
            {children}
          </div>

          {/* ✅ Guia de configuração (BOTTOM RIGHT) */}
          {guideVisible ? (
            <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
              <div className="rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">
                    Guia de configuração
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGuideOpen((v) => !v)}
                      className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label={guideOpen ? "Minimizar" : "Expandir"}
                    >
                      {guideOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideVisible(false)}
                      className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Fechar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                {guideOpen ? (
                  <div className="px-4 pb-4">
                    <div className="mb-3 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.round((completed / GUIDE_ITEMS.length) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      {GUIDE_ITEMS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors text-left",
                            "hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full border flex items-center justify-center",
                              item.done
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40",
                            )}
                          >
                            {item.done ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span
                            className={cn(
                              "flex-1",
                              item.done && "line-through text-muted-foreground",
                            )}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      {completed}/{GUIDE_ITEMS.length} concluídos
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};



