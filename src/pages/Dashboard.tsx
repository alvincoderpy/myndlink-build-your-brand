import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { TrendingUp, ShoppingCart, Package, DollarSign, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt as ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { useTranslation } from "react-i18next";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

interface ChartDataPoint {
  date: string;
  sales: number;
}

interface Stats {
  totalSales: number;
  pendingOrders: number;
  productsSold: number;
  salesGrowth: number;
  totalOrders: number;
  chartData: ChartDataPoint[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { t } = useTranslation();

  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    pendingOrders: 0,
    productsSold: 0,
    salesGrowth: 0,
    totalOrders: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  useEffect(() => {
    loadStats();
  }, [user, currentStore]);

  const loadStats = async (selectedDateRange?: DateRange) => {
    if (!user || !currentStore) return;
    const range = selectedDateRange || dateRange;
    if (!range?.from) return;

    try {
      const startDate = new Date(range.from);
      startDate.setHours(0, 0, 0, 0);
      const endDate = range.to ? new Date(range.to) : new Date(range.from);
      endDate.setHours(23, 59, 59, 999);

      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, created_at, status")
        .eq("store_id", currentStore.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      const totalSales = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingCount = orders?.filter((o) => o.status === "pending").length || 0;

      const orderIds = orders?.map((o) => o.id) || [];
      let productsSold = 0;
      if (orderIds.length > 0) {
        const { data: orderItems } = await supabase.from("order_items").select("product_id").in("order_id", orderIds);
        const uniqueProductIds = new Set(orderItems?.map((item) => item.product_id) || []);
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
        .eq("store_id", currentStore.id)
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString());

      const previousSales = previousOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const growth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

      // Aggregate sales by day for chart
      const salesByDay: Record<string, number> = {};
      orders?.forEach((order) => {
        const day = format(new Date(order.created_at), "dd MMM", { locale: ptBR });
        salesByDay[day] = (salesByDay[day] || 0) + Number(order.total);
      });
      const chartData = Object.entries(salesByDay).map(([date, sales]) => ({
        date,
        sales,
      }));

      setStats({
        totalSales,
        pendingOrders: pendingCount,
        productsSold,
        salesGrowth: growth,
        totalOrders,
        chartData,
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
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-10 bg-muted rounded animate-pulse"></div>
              </CardContent>
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
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd LLL", { locale: ptBR })} -{" "}
                    {format(dateRange.to, "dd LLL", { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, "dd LLL y", { locale: ptBR })
                )
              ) : (
                <span>Selecionar período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
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
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalSales")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toFixed(2)} MT</div>
            {stats.salesGrowth !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${stats.salesGrowth > 0 ? "text-green-600" : "text-destructive"}`}>
                <TrendingUp className="h-3 w-3" />
                {stats.salesGrowth > 0 ? "+" : ""}
                {stats.salesGrowth.toFixed(1)}% {t("dashboard.vsPreviousPeriod")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.pendingOrders")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.inSelectedPeriod")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.productsSold")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsSold}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.withSales")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalOrders")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.inSelectedPeriod")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("dashboard.salesChart")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.chartData.length > 0 ? (
            <ChartContainer
              config={{
                sales: {
                  label: t("dashboard.totalSales"),
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px] w-full"
            >
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  className="text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              {t("dashboard.noSalesData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
