import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
  });
  const [store, setStore] = useState<any>(null);

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

      {/* Logout */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Sessão</h2>
        <p className="text-muted-foreground mb-4">
          Terminar sessão e voltar à página inicial
        </p>
        <Button variant="outline" onClick={handleLogout}>
          Sair da Conta
        </Button>
      </Card>
    </div>
  );
}
