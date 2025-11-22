import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
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
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { currentStore } = useStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
  });
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_marketing: false,
  });
  const [language, setLanguage] = useState(localStorage.getItem("language") || "pt");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    window.location.reload(); // Reload to apply language change
  };

  useEffect(() => {
    if (user) {
      loadProfile();
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
      toast.error(t('settings.errorUpdateProfile'));
    } else {
      toast.success(t('settings.profileUpdated'));
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
      toast.error(t('settings.errorSendEmail'));
    } else {
      toast.success(t('settings.resetEmailSent'));
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    toast.error(t('settings.inDevelopment'));
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-4xl font-bold mb-8 text-foreground">{t('settings.title')}</h1>

      {/* Perfil do Usuário */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{t('settings.profile')}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">{t('settings.firstName')}</Label>
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              placeholder={t('settings.firstNamePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="last_name">{t('settings.lastName')}</Label>
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              placeholder={t('settings.lastNamePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="email">{t('settings.email')}</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {t('settings.emailReadonly')}
            </p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Key className="w-6 h-6" />
          {t('settings.security')}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('settings.securityDesc')}
            </p>
            <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
              {t('settings.changePassword')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          {t('settings.notifications')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">{t('settings.orderNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.orderNotificationsDesc')}
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
          {t('settings.preferences')}
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-base">{t('settings.language')}</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {t('settings.languageDesc')}
            </p>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="text-base">{t('settings.darkMode')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.darkModeDesc')}
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
      {currentStore && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{t('settings.currentPlan')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{getPlanName(currentStore.plan)}</p>
              <p className="text-muted-foreground mt-1">
                {currentStore.plan === 'free' && t('settings.freePlanDesc')}
                {currentStore.plan === 'grow' && t('settings.growPlanDesc')}
                {currentStore.plan === 'business' && t('settings.businessPlanDesc')}
                {currentStore.plan === 'enterprise' && t('settings.enterprisePlanDesc')}
              </p>
            </div>
            {currentStore.plan !== 'enterprise' && (
              <Button onClick={() => navigate("/pricing")}>
                {t('settings.upgrade')}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Sessão */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">{t('settings.session')}</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-base">{t('settings.logout')}</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {t('settings.logoutDesc')}
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('settings.logout')}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Label className="text-base text-red-600">{t('settings.deleteAccountPermanent')}</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {t('settings.deleteAccountWarning')}
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('settings.deleteAccountPermanent')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.confirmDeleteDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                    {t('settings.confirmDeleteBtn')}
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
