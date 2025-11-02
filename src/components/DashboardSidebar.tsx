import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, Package, ShoppingCart, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const isMobile = useIsMobile();
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;
    
    const dragDistance = dragCurrentY - dragStartY;
    
    // Se arrastou mais de 100px para baixo, fecha
    if (dragDistance > 100) {
      onClose();
    }
    
    // Reset
    setIsDragging(false);
    setDragStartY(0);
    setDragCurrentY(0);
  };

  const navLinkClass = ({
    isActive
  }: {
    isActive: boolean;
  }) => `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-colors ${isActive ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`;
  
  return (
    <>
      {/* Overlay escuro (apenas mobile) */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in" 
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 z-50
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? `left-0 right-0 h-auto rounded-t-3xl border-t-2 shadow-2xl
               ${isOpen ? 'bottom-0' : '-bottom-full'}` 
            : 'left-0 top-0 h-screen w-64 border-r-2'
          }
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={
          isMobile && isDragging 
            ? { transform: `translateY(${Math.max(0, dragCurrentY - dragStartY)}px)` }
            : undefined
        }
      >
        {/* Indicador visual de drag (apenas mobile) */}
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3" />
        )}

        {/* Logo (apenas desktop) */}
        {!isMobile && (
          <div className="p-6 border-b-2 border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-black dark:text-white">Myndlink</h1>
          </div>
        )}

        <nav className="p-4">
          <NavLink 
            to="/dashboard" 
            end 
            className={navLinkClass}
            onClick={() => isMobile && onClose()}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/dashboard/store/edit" 
            className={navLinkClass}
            onClick={() => isMobile && onClose()}
          >
            <Store className="w-5 h-5" />
            <span>Minha Loja</span>
          </NavLink>

          <NavLink 
            to="/dashboard/products" 
            className={navLinkClass}
            onClick={() => isMobile && onClose()}
          >
            <Package className="w-5 h-5" />
            <span>Produtos</span>
          </NavLink>

          <NavLink 
            to="/dashboard/orders" 
            className={navLinkClass}
            onClick={() => isMobile && onClose()}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Pedidos</span>
          </NavLink>

          <NavLink 
            to="/dashboard/settings" 
            className={navLinkClass}
            onClick={() => isMobile && onClose()}
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}