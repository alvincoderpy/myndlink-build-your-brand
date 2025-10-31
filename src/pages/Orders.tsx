import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Store } from "lucide-react";

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Load orders
      if (storeData) {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Pedido marcado como concluído",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  ) : !store ? (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Nenhuma Loja Encontrada</h2>
        <p className="text-muted-foreground mb-6">
          Cria a tua primeira loja antes de ver pedidos.
        </p>
        <Link to="/dashboard/store/edit">
          <Button>Criar Loja</Button>
        </Link>
      </Card>
    </div>
  ) : (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os pedidos da tua loja · {orders.length} pedidos
        </p>
      </div>

      {/* Orders List */}
      <div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Ainda não tens pedidos</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Pedido #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-PT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                    {order.status === "completed" ? "Concluído" : "Pendente"}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-bold mb-2">Cliente</h4>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    {order.customer_email && (
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Entrega</h4>
                    <p className="text-sm">{order.customer_address}</p>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Obs: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamento</p>
                    <p className="font-bold">{order.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{order.total} MT</p>
                  </div>
                </div>

                {order.status !== "completed" && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(order.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
