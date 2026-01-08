import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Key, Bell, Languages, Trash2, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

function handleSupabaseError(error: any, fallbackMessage: string) {
  if (!error) return;
  console.error(fallbackMessage, error);
  toast.error(error.message || fallbackMessage);
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: ""
  });
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_marketing: false
  });
  const [language, setLanguage] = useState(localStorage.getItem("language") || "pt");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    window.location.reload();
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (data) {
      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        full_name: data.full_name || "",
        email: data.email || ""
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      full_name: `${profile.first_name} ${profile.last_name}`.trim()
    }).eq("user_id", user.id);
    
    if (error) {
      handleSupabaseError(error, t('settings.errorUpdateProfile'));
    } else {
      toast.success(t('settings.profileUpdated'));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!profile.email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/update-password`
    });
    if (error) {
      handleSupabaseError(error, t('settings.errorSendEmail'));
    } else {
      toast.success(t('settings.resetEmailSent'));
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    toast.error(t('settings.inDevelopment'));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('settings.profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t('settings.firstName')}</Label>
              <Input 
                id="first_name" 
                value={profile.first_name} 
                onChange={e => setProfile({ ...profile, first_name: e.target.value })} 
                placeholder={t('settings.firstNamePlaceholder')} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">{t('settings.lastName')}</Label>
              <Input 
                id="last_name" 
                value={profile.last_name} 
                onChange={e => setProfile({ ...profile, last_name: e.target.value })} 
                placeholder={t('settings.lastNamePlaceholder')} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('settings.email')}</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">{t('settings.emailReadonly')}</p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t('settings.security')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t('settings.securityDesc')}</p>
          <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
            {t('settings.changePassword')}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('settings.orderNotifications')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.orderNotificationsDesc')}</p>
            </div>
            <Switch 
              checked={notifications.email_orders} 
              onCheckedChange={checked => setNotifications({ ...notifications, email_orders: checked })} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t('settings.preferences')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('settings.darkMode')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.darkModeDesc')}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('settings.session')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">{t('settings.logoutDesc')}</p>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('settings.logout')}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Label className="text-sm font-medium text-destructive">{t('settings.deleteAccountPermanent')}</Label>
            <p className="text-xs text-muted-foreground mb-3">{t('settings.deleteAccountWarning')}</p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('settings.deleteAccountPermanent')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.confirmDeleteDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    {t('settings.confirmDeleteBtn')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
