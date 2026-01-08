import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Store, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";

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

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

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

  const handleDownloadPDF = async (order: any) => {
    try {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, products(name)")
        .eq("order_id", order.id);

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(store.name, 20, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("FATURA", 20, 30);
      
      doc.setFontSize(10);
      doc.text(`Pedido: #${order.id.slice(0, 8)}`, 20, 40);
      doc.text(`Data: ${new Date(order.created_at).toLocaleDateString("pt-PT")}`, 20, 46);
      doc.text(`Status: ${order.status === "completed" ? "Concluído" : "Pendente"}`, 20, 52);
      
      doc.setFont("helvetica", "bold");
      doc.text("CLIENTE", 20, 65);
      doc.setFont("helvetica", "normal");
      doc.text(order.customer_name, 20, 72);
      doc.text(order.customer_phone, 20, 78);
      if (order.customer_email) {
        doc.text(order.customer_email, 20, 84);
      }
      doc.text(`Endereço: ${order.customer_address}`, 20, order.customer_email ? 90 : 84);
      
      const tableStartY = order.customer_email ? 105 : 99;
      doc.setFont("helvetica", "bold");
      doc.text("ITENS", 20, tableStartY);
      
      doc.setFont("helvetica", "normal");
      let yPos = tableStartY + 8;
      
      orderItems?.forEach((item: any) => {
        doc.text(item.products.name, 20, yPos);
        doc.text(`${item.quantity} x ${item.price.toFixed(2)} MT`, 120, yPos, { align: "left" });
        doc.text(`${(item.quantity * item.price).toFixed(2)} MT`, 180, yPos, { align: "right" });
        yPos += 6;
      });
      
      yPos += 10;
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      
      if (order.discount_amount > 0) {
        doc.text("Subtotal:", 120, yPos);
        doc.text(`${(order.total + order.discount_amount).toFixed(2)} MT`, 180, yPos, { align: "right" });
        yPos += 6;
        
        doc.text(`Desconto (${order.coupon_code}):`, 120, yPos);
        doc.text(`-${order.discount_amount.toFixed(2)} MT`, 180, yPos, { align: "right" });
        yPos += 6;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL:", 120, yPos);
      doc.text(`${order.total.toFixed(2)} MT`, 180, yPos, { align: "right" });
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Pagamento: ${order.payment_method}`, 20, yPos);
      
      if (order.notes) {
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Observações:", 20, yPos);
        doc.setFont("helvetica", "normal");
        yPos += 6;
        doc.text(order.notes, 20, yPos, { maxWidth: 170 });
      }
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("MyndLink - Plataforma de E-commerce", 105, 280, { align: "center" });
      
      doc.save(`fatura-${order.id.slice(0, 8)}.pdf`);
      
      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os pedidos da tua loja</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-28" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma Loja Encontrada</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Cria a tua primeira loja antes de ver pedidos.
            </p>
            <Link to="/dashboard/store/edit">
              <Button>Criar Loja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os pedidos da tua loja · {orders.length} pedidos
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Nenhum pedido ainda</h2>
            <p className="text-sm text-muted-foreground">Os pedidos dos clientes aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cliente</h4>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    {order.customer_email && (
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Entrega</h4>
                    <p className="text-sm">{order.customer_address}</p>
                    {order.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Obs: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Pagamento</p>
                      <p className="text-sm font-medium">{order.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{order.total.toFixed(2)} MT</p>
                      {order.discount_amount > 0 && (
                        <p className="text-xs text-green-600">
                          Desconto: -{order.discount_amount.toFixed(2)} MT ({order.coupon_code})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(order)}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                    {order.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(order.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
