import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, ShoppingCart, Package, DollarSign, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt as ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

interface Stats {
  totalSales: number;
  pendingOrders: number;
  productsSold: number;
  salesGrowth: number;
  totalOrders: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    pendingOrders: 0,
    productsSold: 0,
    salesGrowth: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async (selectedDateRange?: DateRange) => {
    if (!user) return;
    
    const range = selectedDateRange || dateRange;
    if (!range?.from) return;

    try {
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) {
        setLoading(false);
        return;
      }

      const startDate = new Date(range.from);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = range.to ? new Date(range.to) : new Date(range.from);
      endDate.setHours(23, 59, 59, 999);

      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, created_at, status")
        .eq("store_id", store.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      const totalSales = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingCount = orders?.filter(o => o.status === "pending").length || 0;

      const orderIds = orders?.map(o => o.id) || [];
      let productsSold = 0;

      if (orderIds.length > 0) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id")
          .in("order_id", orderIds);

        const uniqueProductIds = new Set(orderItems?.map(item => item.product_id) || []);
        productsSold = uniqueProductIds.size;
      }

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
      const previousEndDate = new Date(startDate);
      previousEndDate.setMilliseconds(-1);

      const { data: previousOrders } = await supabase
        .from("orders")
        .select("total")
        .eq("store_id", store.id)
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString());

      const previousSales = previousOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const growth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

      setStats({
        totalSales,
        pendingOrders: pendingCount,
        productsSold,
        salesGrowth: growth,
        totalOrders,
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
      <OnboardingChecklist />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do teu negócio
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-auto justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateRange?.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "dd MMM", { locale: ptBR })} -{" "}
              {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
            </>
          ) : (
            format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
          )
        ) : (
          <span>Selecionar período</span>
        )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={(range) => {
          setDateRange(range);
          if (range?.from) {
            loadStats(range);
          }
        }}
        numberOfMonths={1}
        locale={ptBR}
        className="pointer-events-auto"
      />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Vendas Totais
            </p>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalSales.toFixed(2)} MT
          </p>
          {stats.salesGrowth !== 0 && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${stats.salesGrowth > 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className="w-3 h-3" />
              {stats.salesGrowth > 0 ? "+" : ""}
              {stats.salesGrowth.toFixed(1)}% vs período anterior
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
            No período selecionado
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Produtos Vendidos
            </p>
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.productsSold}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Com vendas no período
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
            {stats.totalOrders}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            No período selecionado
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