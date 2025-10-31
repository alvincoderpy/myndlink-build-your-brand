import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";

interface Stats {
  totalSales: number;
  pendingOrders: number;
  activeProducts: number;
  salesGrowth: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    pendingOrders: 0,
    activeProducts: 0,
    salesGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get user's store
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) {
        setLoading(false);
        return;
      }

      // Get total sales for current month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("total, created_at")
        .eq("store_id", store.id);

      // Calculate stats
      const currentMonthOrders = orders?.filter(
        (order) => new Date(order.created_at) >= currentMonth
      ) || [];

      const totalSales = currentMonthOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      // Get pending orders
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("status", "pending");

      // Get active products
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("is_active", true);

      // Calculate growth (compare with previous month)
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const previousMonthOrders = orders?.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= previousMonth && orderDate < currentMonth;
      }) || [];

      const previousMonthSales = previousMonthOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      const growth =
        previousMonthSales > 0
          ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
          : 0;

      setStats({
        totalSales,
        pendingOrders: pendingCount || 0,
        activeProducts: productsCount || 0,
        salesGrowth: growth,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do teu negócio
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-12 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do teu negócio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Vendas do Mês
            </p>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalSales.toFixed(2)} MT
          </p>
          {stats.salesGrowth !== 0 && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 ${
                stats.salesGrowth > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {stats.salesGrowth > 0 ? "+" : ""}
              {stats.salesGrowth.toFixed(1)}% vs mês anterior
            </p>
          )}
        </Card>

        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Pedidos Pendentes
            </p>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.pendingOrders}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Para processar
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Produtos Ativos
            </p>
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.activeProducts}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            No catálogo
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Pedidos Totais
            </p>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.pendingOrders}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Este mês
          </p>
        </Card>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            <a
              href="/dashboard/products"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="font-medium text-sm">Adicionar Produto</p>
              <p className="text-xs text-muted-foreground">
                Expande o teu catálogo
              </p>
            </a>
            <a
              href="/dashboard/orders"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="font-medium text-sm">Ver Pedidos</p>
              <p className="text-xs text-muted-foreground">
                Gerir pedidos pendentes
              </p>
            </a>
            <a
              href="/dashboard/store/edit"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="font-medium text-sm">Editar Loja</p>
              <p className="text-xs text-muted-foreground">
                Personalizar a tua loja
              </p>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Dicas para Crescer</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Adiciona imagens de qualidade aos produtos</p>
            <p>✓ Mantém o stock atualizado</p>
            <p>✓ Responde rapidamente aos pedidos</p>
            <p>✓ Partilha a tua loja nas redes sociais</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;