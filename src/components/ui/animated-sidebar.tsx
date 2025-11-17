import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, Store, Package, ShoppingCart, Ticket, Settings } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: { children: React.ReactNode }) => {
  return (
    <>
      <DesktopSidebar>{props.children}</DesktopSidebar>
      <MobileSidebar>{props.children}</MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-muted/30 border-r border-border w-[240px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "240px" : "60px") : "240px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-12 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-background border-b border-border w-full"
        )}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-foreground cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background z-[100] flex flex-col justify-between p-6",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <NavLink
      to={link.href}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-start gap-3 group/sidebar py-2.5 px-2 rounded-md transition-all duration-150",
          "hover:bg-accent/10",
          isActive && "bg-accent/20 text-accent font-medium",
          className
        )
      }
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-0.5 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};

// Navigation links
const links: Links[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
  },
  {
    label: "Minha Loja",
    href: "/dashboard/store",
    icon: <Store className="w-5 h-5 flex-shrink-0" />,
  },
  {
    label: "Produtos",
    href: "/dashboard/products",
    icon: <Package className="w-5 h-5 flex-shrink-0" />,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="w-5 h-5 flex-shrink-0" />,
  },
  {
    label: "Cupons",
    href: "/dashboard/coupons",
    icon: <Ticket className="w-5 h-5 flex-shrink-0" />,
  },
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5 flex-shrink-0" />,
  },
];

function SidebarContent() {
  const { open } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        <motion.span
          animate={{
            display: open ? "inline-block" : "none",
            opacity: open ? 1 : 0,
          }}
          className="font-semibold text-base whitespace-nowrap"
        >
          MyndLink
        </motion.span>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <SidebarLink key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
}

export function AnimatedSidebar() {
  return (
    <Sidebar animate={true}>
      <SidebarBody>
        <SidebarContent />
      </SidebarBody>
    </Sidebar>
  );
}
