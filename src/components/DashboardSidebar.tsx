import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, Store, Package, ShoppingCart, Settings, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [{
  to: "/dashboard",
  icon: Home,
  labelKey: "nav.home",
  end: true
}, {
  to: "/dashboard/store",
  icon: Store,
  labelKey: "nav.myStore"
}, {
  to: "/dashboard/analytics",
  icon: LayoutDashboard,
  labelKey: "nav.dashboard"
}, {
  to: "/dashboard/products",
  icon: Package,
  labelKey: "nav.products"
}, {
  to: "/dashboard/orders",
  icon: ShoppingCart,
  labelKey: "nav.orders"
}, {
  to: "/dashboard/coupons",
  icon: Tag,
  labelKey: "nav.coupons"
}, {
  to: "/dashboard/settings",
  icon: Settings,
  labelKey: "nav.settings"
}];
export function DashboardSidebar() {
  const {
    t
  } = useTranslation();
  const {
    state
  } = useSidebar();
  const isCollapsed = state === "collapsed";
  return <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-[13px]">
        <div className="flex items-center gap-2">
          {!isCollapsed && <>
              <img src={logoLight} alt="MyndLink" className="h-7 dark:hidden" />
              <img src={logoDark} alt="MyndLink" className="h-7 hidden dark:block" />
              <span className="font-semibold text-lg">MyndLink</span>
            </>}
          {isCollapsed && <img src={logoLight} alt="MyndLink" className="h-7 dark:hidden mx-auto" />}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={t(item.labelKey)}>
                    <NavLink to={item.to} end={item.end} className={({
                  isActive
                }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{t(item.labelKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}