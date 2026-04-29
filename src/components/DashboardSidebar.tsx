// DashboardSidebar.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  FileText,
  HelpCircle,
  Home,
  LayoutTemplate,
  LogOut,
  MoreVertical,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";

type NavItem = {
  to: string;
  icon: React.ElementType;
  labelKey: string;
  fallback: string;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    icon: Home,
    labelKey: "nav.home",
    fallback: "Início",
    end: true,
  },
  {
    to: "/dashboard/orders",
    icon: ShoppingCart,
    labelKey: "nav.orders",
    fallback: "Pedidos",
  },
  {
    to: "/dashboard/products",
    icon: Package,
    labelKey: "nav.products",
    fallback: "Produtos",
  },
  {
    to: "/dashboard/invoices",
    icon: FileText,
    labelKey: "nav.invoices",
    fallback: "Faturas",
  },
  {
    to: "/dashboard/coupons",
    icon: Tag,
    labelKey: "nav.coupons",
    fallback: "Cupons",
  },
  {
    to: "/dashboard/analytics",
    icon: BarChart3,
    labelKey: "nav.analytics",
    fallback: "Analytics",
  },
  {
    to: "/dashboard/store",
    icon: Store,
    labelKey: "nav.myStore",
    fallback: "Minha Loja",
  },
  {
    to: "/dashboard/templates",
    icon: LayoutTemplate,
    labelKey: "nav.templates",
    fallback: "Templates",
  },
];

function getInitials(text?: string) {
  if (!text) return "U";
  const parts = text
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);

  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function DashboardSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const HELP_URL = "https://example.com";

  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");

  const email = user?.email ?? "";

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name,last_name,full_name,email")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        const first = (data?.first_name ?? "").trim();
        const last = (data?.last_name ?? "").trim();
        const full = (data?.full_name ?? "").trim();
        const merged = `${first} ${last}`.trim();

        const finalName =
          full ||
          merged ||
          (email && email.includes("@") ? email.split("@")[0] : "User");

        const finalEmail = (data?.email ?? "").trim() || email;

        if (!cancelled) {
          setProfileName(finalName);
          setProfileEmail(finalEmail);
        }
      } catch {
        const fallbackName =
          email && email.includes("@") ? email.split("@")[0] : "User";
        if (!cancelled) {
          setProfileName(fallbackName);
          setProfileEmail(email);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id, email]);

  const displayName = useMemo(() => profileName || "User", [profileName]);
  const displayEmail = useMemo(
    () => profileEmail || email,
    [profileEmail, email],
  );

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
      "text-muted-foreground hover:bg-muted hover:text-foreground",
      isActive && "bg-muted text-foreground font-semibold",
    );

  const handleHelp = () => {
    window.open(HELP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "sticky top-14 flex h-[calc(100vh-56px)] w-[260px] flex-col px-3 py-4",
        // Lighter sidebar shell
        "bg-background/80 supports-[backdrop-filter]:bg-background/70 backdrop-blur-sm",
      )}
    >
      <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClassName}
          >
            <item.icon className="h-4 w-4" />
            <span>{t(item.labelKey, { defaultValue: item.fallback })}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleHelp}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Get Help</span>
        </Button>

        <NavLink to="/dashboard/settings" className={linkClassName}>
          <Settings className="h-4 w-4" />
          <span>{t("nav.settings", { defaultValue: "Configurações" })}</span>
        </NavLink>

        <div className="mt-2 flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-muted transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted text-foreground">
              {getInitials(displayName || displayEmail)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {displayEmail}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="User menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                Notifications
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


