import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Store, Package, ShoppingCart, Settings, LogOut, Plus } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              MYND
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie a tua loja e produtos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer">
            <Link to="/dashboard/store/edit">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Store className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Minha Loja</h3>
                  <p className="text-sm text-muted-foreground">Editar loja</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer">
            <Link to="/dashboard/products">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Package className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Produtos</h3>
                  <p className="text-sm text-muted-foreground">Gerir produtos</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer">
            <Link to="/dashboard/orders">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Pedidos</h3>
                  <p className="text-sm text-muted-foreground">Ver pedidos</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer">
            <Link to="/dashboard/settings">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Settings className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Configurações</h3>
                  <p className="text-sm text-muted-foreground">Conta e plano</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Create Store CTA */}
        <Card className="p-12 text-center border-2 border-dashed border-primary/30">
          <div className="max-w-xl mx-auto">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cria a Tua Primeira Loja</h2>
            <p className="text-muted-foreground mb-6">
              Começa a vender online em minutos com templates prontos
            </p>
            <Link to="/dashboard/store/edit">
              <Button variant="hero" size="lg">
                Criar Loja Agora
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
