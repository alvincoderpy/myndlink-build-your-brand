import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Store {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  is_published: boolean;
  template: string;
  template_config: any;
  created_at: string;
  updated_at: string;
}

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  switchStore: (storeId: string) => void;
  createStore: () => void;
  refreshStores: () => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStores();
    } else {
      setStores([]);
      setCurrentStore(null);
      setLoading(false);
    }
  }, [user]);

  const loadStores = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);

      // Load saved store ID or use first store
      const savedStoreId = localStorage.getItem('currentStoreId');
      const storeToSet = savedStoreId
        ? data?.find((s) => s.id === savedStoreId) || data?.[0]
        : data?.[0];

      if (storeToSet) {
        setCurrentStore(storeToSet);
        localStorage.setItem('currentStoreId', storeToSet.id);
      }
    } catch (error: any) {
      console.error('Error loading stores:', error);
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const switchStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('currentStoreId', store.id);
      toast.success('Loja trocada com sucesso!');
    }
  };

  const createStore = () => {
    // Navigate to store editor
    window.location.href = '/dashboard/store/edit';
  };

  const refreshStores = () => {
    loadStores();
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        stores,
        switchStore,
        createStore,
        refreshStores,
        loading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
