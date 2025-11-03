import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Check, Tag } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, store } = location.state || {};
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    payment_method: "mpesa",
    notes: "",
  });

  const checkoutSchema = z.object({
    customer_name: z.string().trim().min(2, t('checkout.validation.nameMin')).max(100, t('checkout.validation.nameMax')),
    customer_email: z.string().trim().email(t('checkout.validation.emailInvalid')).max(255, t('checkout.validation.emailMax')).optional().or(z.literal('')),
    customer_phone: z.string().trim().regex(/^[+]?[0-9]{9,15}$/, t('checkout.validation.phoneInvalid')),
    customer_address: z.string().trim().min(10, t('checkout.validation.addressMin')).max(500, t('checkout.validation.addressMax')),
    notes: z.string().max(1000, t('checkout.validation.notesMax')).optional(),
    payment_method: z.enum(['mpesa', 'emola', 'card'], { errorMap: () => ({ message: t('checkout.validation.paymentRequired') }) })
  });

  if (!cart || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Carrinho vazio</h1>
          <p className="text-muted-foreground mb-4">Adicione produtos antes de finalizar</p>
          <Button onClick={() => navigate(-1)}>Voltar à Loja</Button>
        </Card>
      </div>
    );
  }

  const getSubtotal = () => {
    return cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    return (getSubtotal() * appliedCoupon.discount_percent) / 100;
  };

  const getTotalPrice = () => {
    return getSubtotal() - getDiscount();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('checkout.enterCoupon'));
      return;
    }

    setCheckingCoupon(true);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("store_id", store.id)
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error(t('checkout.couponInvalid'));
        return;
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error(t('checkout.couponExpired'));
        return;
      }

      setAppliedCoupon(data);
      toast.success(t('checkout.couponApplied', { percent: data.discount_percent }));
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      toast.error(t('checkout.errorVerifyCoupon'));
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success(t('checkout.couponRemoved'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with zod schema
    const validationResult = checkoutSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      // Prepare cart items for atomic function
      const cartItems = cart.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      // Call atomic order function with row-level locking
      const { data, error } = await supabase.rpc('create_order_atomic', {
        p_store_id: store.id,
        p_customer_name: formData.customer_name,
        p_customer_email: formData.customer_email || null,
        p_customer_phone: formData.customer_phone,
        p_customer_address: formData.customer_address,
        p_payment_method: formData.payment_method,
        p_notes: formData.notes || null,
        p_coupon_code: appliedCoupon?.code || null,
        p_discount_amount: getDiscount(),
        p_cart_items: cartItems
      });

      if (error) throw error;

      // Type assertion for atomic function response
      const result = data as { success: boolean; error?: string; order_id?: string };

      // Check result from atomic function
      if (!result.success) {
        throw new Error(result.error || 'Order creation failed');
      }

      setOrderNumber(result.order_id!.substring(0, 8).toUpperCase());
      setOrderCreated(true);
      toast.success(t('checkout.orderCreated'));
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.message?.includes('Insufficient stock')) {
        toast.error(t('checkout.insufficientStock'));
      } else {
        toast.error(t('checkout.errorOrder'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu pedido foi registrado com sucesso
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-1">Número do Pedido</p>
            <p className="text-2xl font-bold">#{orderNumber}</p>
          </div>
          <div className="text-left mb-6 space-y-2">
            <p className="text-sm">
              <span className="font-bold">Total:</span> {getTotalPrice().toFixed(2)} MT
            </p>
            <p className="text-sm">
              <span className="font-bold">Pagamento:</span>{" "}
              {formData.payment_method === "mpesa" && "M-Pesa"}
              {formData.payment_method === "emola" && "e-Mola"}
              {formData.payment_method === "card" && "Cartão"}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Entraremos em contato em breve para confirmar o pagamento e envio.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate(`/store/${store.subdomain}`)}
          >
            Voltar à Loja
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Dados de Entrega</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer_name">Nome Completo *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">Telefone *</Label>
                      <Input
                        id="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_phone: e.target.value })
                        }
                        placeholder="+258 XX XXX XXXX"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email (opcional)</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_address">Endereço de Entrega *</Label>
                      <Textarea
                        id="customer_address"
                        value={formData.customer_address}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_address: e.target.value })
                        }
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={2}
                        placeholder="Instruções especiais, horário preferido, etc."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Método de Pagamento</h2>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                        M-Pesa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="emola" id="emola" />
                      <Label htmlFor="emola" className="flex-1 cursor-pointer">
                        e-Mola
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Cartão de Crédito/Débito
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground mt-4">
                    Você receberá instruções de pagamento após confirmar o pedido
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Processando..." : "Confirmar Pedido"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-bold">
                      {(item.price * item.quantity).toFixed(2)} MT
                    </span>
                  </div>
                ))}
               </div>
              
              {/* Coupon Code */}
              <div className="border-t border-border pt-4 mb-4">
                <Label className="text-sm mb-2 block">Cupom de Desconto</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <Badge variant="secondary">-{appliedCoupon.discount_percent}%</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      disabled={checkingCoupon}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={checkingCoupon}
                    >
                      {checkingCoupon ? "..." : "Aplicar"}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{getSubtotal().toFixed(2)} MT</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({appliedCoupon.discount_percent}%):</span>
                    <span>-{getDiscount().toFixed(2)} MT</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{getTotalPrice().toFixed(2)} MT</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
