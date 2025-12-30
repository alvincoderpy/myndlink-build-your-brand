import { Menu, Store, LogOut, Check, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const getInitials = (name: string): string => {
  if (!name) return "??";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getEmailInitials = (email: string): string => {
  if (!email) return "??";
  const localPart = email.split("@")[0];
  return localPart.substring(0, 2).toUpperCase();
};

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  const { currentStore, stores, switchStore } = useStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleViewAllStores = () => {
    navigate("/my-store");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border flex items-center justify-between px-3">
      {/* Left - Menu Button */}
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      {/* Center - Store Name or Logo */}
      <div className="flex-1 flex justify-center">
        {currentStore ? (
          <span className="font-semibold text-foreground truncate max-w-[180px]">
            {currentStore.name}
          </span>
        ) : (
          <img 
            src={logoDark} 
            alt="MyndLink" 
            className="h-6 dark:hidden" 
          />
        )}
        {!currentStore && (
          <img 
            src={logoLight} 
            alt="MyndLink" 
            className="h-6 hidden dark:block" 
          />
        )}
      </div>

      {/* Right - Store Avatar */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {currentStore ? getInitials(currentStore.name) : <Store className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0 bg-popover border border-border shadow-lg">
          {/* Current Store */}
          {currentStore && (
            <>
              <div className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                    {getInitials(currentStore.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{currentStore.name}</p>
                  <p className="text-xs text-muted-foreground">{currentStore.subdomain}.myndlink.com</p>
                </div>
                <Check className="h-5 w-5 text-green-500 shrink-0" />
              </div>
              <Separator />
            </>
          )}

          {/* Other Stores */}
          {stores.filter(s => s.id !== currentStore?.id).length > 0 && (
            <>
              <div className="py-1">
                {stores.filter(s => s.id !== currentStore?.id).map(store => (
                  <button
                    key={store.id}
                    onClick={() => switchStore(store.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-500 text-white text-sm font-semibold">
                        {getInitials(store.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-foreground truncate">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.subdomain}.myndlink.com</p>
                    </div>
                  </button>
                ))}
              </div>
              <Separator />
            </>
          )}

          {/* View All Stores */}
          <button
            onClick={handleViewAllStores}
            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Store className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">Todas as lojas</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <Separator />

          {/* User Profile */}
          {user && (
            <>
              <div className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-semibold">
                    {getEmailInitials(user.email || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-destructive"
          >
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Terminar sessão</span>
          </button>
        </PopoverContent>
      </Popover>
    </header>
  );
};

