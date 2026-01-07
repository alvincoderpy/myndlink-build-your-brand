import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useForceTheme } from "@/hooks/useForceTheme";
import { Check, X } from "lucide-react";
import logoLight from "@/assets/logo-light.png";

const passwordRequirements = [
  { key: "length", test: (p: string) => p.length >= 8, label: "Mínimo 8 caracteres" },
  { key: "uppercase", test: (p: string) => /[A-Z]/.test(p), label: "Uma letra maiúscula" },
  { key: "lowercase", test: (p: string) => /[a-z]/.test(p), label: "Uma letra minúscula" },
  { key: "number", test: (p: string) => /[0-9]/.test(p), label: "Um número" },
  { key: "special", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: "Um caractere especial" },
];
const Auth = () => {
  const { t } = useTranslation();
  useForceTheme("light");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      passed: req.test(password),
    }));
  }, [password]);

  const isPasswordValid = passwordValidation.every((req) => req.passed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !isPasswordValid) {
      toast.error("A senha não atende aos requisitos mínimos de segurança");
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(t("auth.welcomeBack"));
        navigate("/dashboard");
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
            },
          },
        });
        if (error) throw error;
        toast.success(t("auth.accountCreated"));
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <div className="flex items-center justify-center gap-2">
              <img src={logoLight} alt="MyndLink" className="h-12" />
              <span className="text-2xl font-bold">MyndLink</span>
            </div>
          </Link>
        </div>

        <Card className="p-8 shadow-glow">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{isLogin ? t("auth.login") : t("auth.signup")}</h2>
            <p className="text-sm text-muted-foreground">
              {isLogin ? t("auth.loginWelcome") : t("auth.signupWelcome")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t("auth.firstName")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t("auth.lastName")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {!isLogin && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordValidation.map((req) => (
                    <div
                      key={req.key}
                      className={`flex items-center gap-2 text-xs ${
                        req.passed ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {req.passed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <Link to="/password-reset" className="text-sm text-muted-foreground hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.pleaseWait") : isLogin ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:underline">
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t("auth.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Auth;
