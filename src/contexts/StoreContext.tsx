import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Store } from '@/types/store';

export interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  switchStore: (storeId: string) => void;
  createStore: () => void;
  refreshStores: () => void;
  loading: boolean;
}

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);

export function StoreProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStores = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as Store[];
      setStores(typedData);

      // Load saved store ID or use first store
      const savedStoreId = localStorage.getItem('currentStoreId');
      const storeToSet = savedStoreId
        ? typedData.find((s) => s.id === savedStoreId) || typedData[0]
        : typedData[0];

      if (storeToSet) {
        setCurrentStore(storeToSet);
        localStorage.setItem('currentStoreId', storeToSet.id);
      }
    } catch (error: unknown) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStores();
    } else {
      setStores([]);
      setCurrentStore(null);
      setLoading(false);
    }
  }, [loadStores, user]);

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
    navigate('/dashboard/store/edit');
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


