import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const handleDownloadPDF = async (order: any) => {
    try {
      // Fetch order items
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, products(name)")
        .eq("order_id", order.id);

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(store.name, 20, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("FATURA", 20, 30);
      
      // Order Info
      doc.setFontSize(10);
      doc.text(`Pedido: #${order.id.slice(0, 8)}`, 20, 40);
      doc.text(`Data: ${new Date(order.created_at).toLocaleDateString("pt-PT")}`, 20, 46);
      doc.text(`Status: ${order.status === "completed" ? "Concluído" : "Pendente"}`, 20, 52);
      
      // Customer Info
      doc.setFont("helvetica", "bold");
      doc.text("CLIENTE", 20, 65);
      doc.setFont("helvetica", "normal");
      doc.text(order.customer_name, 20, 72);
      doc.text(order.customer_phone, 20, 78);
      if (order.customer_email) {
        doc.text(order.customer_email, 20, 84);
      }
      doc.text(`Endereço: ${order.customer_address}`, 20, order.customer_email ? 90 : 84);
      
      // Items Table
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
      
      // Totals
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
      
      // Payment Method
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Pagamento: ${order.payment_method}`, 20, yPos);
      
      // Notes
      if (order.notes) {
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Observações:", 20, yPos);
        doc.setFont("helvetica", "normal");
        yPos += 6;
        doc.text(order.notes, 20, yPos, { maxWidth: 170 });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("MyndLink - Plataforma de E-commerce", 105, 280, { align: "center" });
      
      // Save
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

  return loading ? (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-8 w-32" />
            </div>
          </Card>
        ))}
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
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground">Os pedidos dos clientes aparecerão aqui</p>
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

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamento</p>
                      <p className="font-bold">{order.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{order.total.toFixed(2)} MT</p>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
