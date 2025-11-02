import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Key, Bell, Languages, Trash2, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
  });
  const [store, setStore] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_marketing: false,
  });
  const [language, setLanguage] = useState("pt");

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStore();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();
    
    if (data) {
      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        full_name: data.full_name || "",
        email: data.email || "",
      });
    }
  };

  const loadStore = async () => {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user?.id)
      .single();
    
    if (data) {
      setStore(data);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: `${profile.first_name} ${profile.last_name}`.trim(),
      })
      .eq("user_id", user?.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getPlanName = (plan: string) => {
    const plans: any = {
      free: "Free",
      grow: "Grow",
      business: "Business",
      enterprise: "Enterprise"
    };
    return plans[plan] || "Free";
  };

  const handleChangePassword = async () => {
    if (!profile.email) return;
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      toast.error("Erro ao enviar email");
    } else {
      toast.success("Email de redefinição enviado! Verifica a tua caixa de entrada.");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    toast.error("Funcionalidade em desenvolvimento");
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Configurações</h1>

      {/* Perfil do Usuário */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Perfil do Usuário</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">Nome</Label>
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              placeholder="Teu nome"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Apelido</Label>
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              placeholder="Teu apelido"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Email não pode ser alterado
            </p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Key className="w-6 h-6" />
          Segurança
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Altera a tua senha para manter a conta segura
            </p>
            <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
              Alterar Senha
            </Button>
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notificações
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Avisos de novos pedidos</Label>
              <p className="text-sm text-muted-foreground">
                Recebe emails quando houver novos pedidos
              </p>
            </div>
            <Switch 
              checked={notifications.email_orders}
              onCheckedChange={(checked) => 
                setNotifications({...notifications, email_orders: checked})
              }
            />
          </div>
        </div>
      </Card>

      {/* Preferências */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Languages className="w-6 h-6" />
          Preferências
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-base">Idioma</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Escolhe o idioma da interface
            </p>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">🇵🇹 Português</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="text-base">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Ativa o tema escuro
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Plano Atual */}
      {store && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Plano Atual</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{getPlanName(store.plan)}</p>
              <p className="text-muted-foreground mt-1">
                {store.plan === 'free' && 'Até 10 produtos'}
                {store.plan === 'grow' && 'Até 100 produtos'}
                {store.plan === 'business' && 'Até 1.000 produtos'}
                {store.plan === 'enterprise' && 'Produtos ilimitados'}
              </p>
            </div>
            {store.plan !== 'enterprise' && (
              <Button onClick={() => navigate("/pricing")}>
                Fazer Upgrade
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Sessão */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Sessão</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-base">Sair da Conta</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Terminar a sessão atual
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Label className="text-base text-red-600">Eliminar Conta Permanentemente</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Esta ação não pode ser desfeita
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Conta Permanentemente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os teus dados, produtos e pedidos serão eliminados permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                    Sim, eliminar conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
