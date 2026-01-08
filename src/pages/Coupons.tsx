import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag, Store } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function Coupons() {
  const { t } = useTranslation();
  const { currentStore, loading: storeLoading } = useStore();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: '',
    expires_at: '',
  });

  useEffect(() => {
    if (!storeLoading && currentStore) {
      loadCoupons();
    } else if (!storeLoading && !currentStore) {
      setLoading(false);
    }
  }, [currentStore, storeLoading]);

  const loadCoupons = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', currentStore.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      toast.error(t('common.error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const code = formData.code.trim().toUpperCase();
    const discount = parseFloat(formData.discount_percent);

    if (code.length < 4 || code.length > 20) {
      toast.error(t('coupons.errorCode'));
      return false;
    }

    if (!/^[A-Z0-9]+$/.test(code)) {
      toast.error(t('coupons.errorCodeFormat'));
      return false;
    }

    if (isNaN(discount) || discount < 1 || discount > 100) {
      toast.error(t('coupons.errorDiscount'));
      return false;
    }

    if (formData.expires_at && new Date(formData.expires_at) <= new Date()) {
      toast.error(t('coupons.errorExpiration'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStore || !validateForm()) return;

    try {
      const couponData = {
        store_id: currentStore.id,
        code: formData.code.trim().toUpperCase(),
        discount_percent: parseFloat(formData.discount_percent),
        expires_at: formData.expires_at || null,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        toast.success(t('coupons.updated'));
      } else {
        const { error } = await supabase.from('coupons').insert(couponData);

        if (error) throw error;
        toast.success(t('coupons.created'));
      }

      setIsDialogOpen(false);
      setEditingCoupon(null);
      setFormData({ code: '', discount_percent: '', expires_at: '' });
      loadCoupons();
    } catch (error: any) {
      toast.error(t('common.error'), { description: error.message });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_percent: coupon.discount_percent.toString(),
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().split('T')[0]
        : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('coupons.confirmDelete'))) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;

      toast.success(t('coupons.deleted'));
      loadCoupons();
    } catch (error: any) {
      toast.error(t('common.error'), { description: error.message });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      toast.success(
        coupon.is_active ? t('coupons.deactivated') : t('coupons.activated')
      );
      loadCoupons();
    } catch (error: any) {
      toast.error(t('common.error'), { description: error.message });
    }
  };

  if (loading || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('orders.noStore')}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t('coupons.createStore')}</p>
            <Link to="/dashboard/store/edit">
              <Button>{t('products.createStoreBtn')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('coupons.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('coupons.subtitle')} · {coupons.length} {t('coupons.count')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCoupon(null);
                setFormData({ code: '', discount_percent: '', expires_at: '' });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('coupons.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? t('coupons.edit') : t('coupons.add')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('coupons.code')} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder={t('coupons.codePlaceholder')}
                  maxLength={20}
                  required
                />
                <p className="text-xs text-muted-foreground">{t('coupons.codeNote')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">{t('coupons.discount')} *</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  placeholder={t('coupons.discountPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">{t('coupons.expiresAt')}</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingCoupon ? t('common.save') : t('coupons.add')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{t('coupons.noCoupons')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('coupons.addFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();

            return (
              <Card key={coupon.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base font-semibold">{coupon.code}</CardTitle>
                    </div>
                    <Badge
                      variant={isExpired ? 'outline' : coupon.is_active ? 'default' : 'secondary'}
                    >
                      {isExpired
                        ? t('coupons.expired')
                        : coupon.is_active
                        ? t('coupons.active')
                        : t('coupons.inactive')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">{coupon.discount_percent}%</p>
                    {coupon.expires_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('coupons.expires')}: {new Date(coupon.expires_at).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={Boolean(coupon.is_active) && !isExpired}
                        onCheckedChange={() => handleToggleActive(coupon)}
                        disabled={isExpired || false}
                      />
                      <span className="text-xs text-muted-foreground">
                        {coupon.is_active ? t('coupons.active') : t('coupons.inactive')}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(coupon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
