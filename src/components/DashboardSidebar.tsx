import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, Package, ShoppingCart, Settings } from "lucide-react";

export function DashboardSidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-colors ${
      isActive
        ? "bg-black text-white dark:bg-white dark:text-black"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r-2 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-black dark:text-white">MyndLink</h1>
      </div>

      <nav className="p-4">
        <NavLink to="/dashboard" end className={navLinkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/store/edit" className={navLinkClass}>
          <Store className="w-5 h-5" />
          <span>Minha Loja</span>
        </NavLink>

        <NavLink to="/dashboard/products" className={navLinkClass}>
          <Package className="w-5 h-5" />
          <span>Produtos</span>
        </NavLink>

        <NavLink to="/dashboard/orders" className={navLinkClass}>
          <ShoppingCart className="w-5 h-5" />
          <span>Pedidos</span>
        </NavLink>

        <NavLink to="/dashboard/settings" className={navLinkClass}>
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </NavLink>
      </nav>
    </aside>
  );
}
