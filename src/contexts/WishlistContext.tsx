import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useAppState } from './AppStateContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

interface WishlistItem {
  id: string;
  product: Product;
  created_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNotification, addError } = useAppState();

  // Load wishlist items
  const loadWishlistItems = async () => {
    if (!user) {
      // Load from localStorage for anonymous users
      loadLocalWishlist();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          created_at,
          product:products (
            id,
            name,
            price,
            image_url,
            description,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const wishlistItems: WishlistItem[] = data?.map(item => ({
        id: item.id,
        product: item.product as Product,
        created_at: item.created_at
      })) || [];

      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      addError('Erro ao carregar lista de desejos');
    } finally {
      setLoading(false);
    }
  };

  // Load from localStorage
  const loadLocalWishlist = () => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const wishlistItems = JSON.parse(stored);
        setItems(wishlistItems);
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage
  const saveLocalWishlist = (wishlistItems: WishlistItem[]) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving local wishlist:', error);
    }
  };

  // Add to wishlist
  const addToWishlist = async (product: Product) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: product.id
          });

        if (error) throw error;

        // Add to local state
        const newItem: WishlistItem = {
          id: Date.now().toString(),
          product,
          created_at: new Date().toISOString()
        };
        setItems(prev => [...prev, newItem]);
      } else {
        // Handle anonymous users
        const newItem: WishlistItem = {
          id: Date.now().toString(),
          product,
          created_at: new Date().toISOString()
        };
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        saveLocalWishlist(updatedItems);
      }

      addNotification({
        type: 'success',
        title: 'Produto adicionado',
        message: `${product.name} foi adicionado à sua lista de desejos`
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      addError('Erro ao adicionar produto à lista de desejos');
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      const item = items.find(item => item.product.id === productId);
      if (!item) return;

      if (user) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      }

      // Remove from local state
      const updatedItems = items.filter(item => item.product.id !== productId);
      setItems(updatedItems);

      if (!user) {
        saveLocalWishlist(updatedItems);
      }

      addNotification({
        type: 'info',
        title: 'Produto removido',
        message: `${item.product.name} foi removido da sua lista de desejos`
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      addError('Erro ao remover produto da lista de desejos');
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setItems([]);
      
      if (!user) {
        localStorage.removeItem('wishlist');
      }

      addNotification({
        type: 'info',
        title: 'Lista limpa',
        message: 'Sua lista de desejos foi limpa'
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      addError('Erro ao limpar lista de desejos');
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  // Calculate item count
  const itemCount = items.length;

  // Load items when user changes
  useEffect(() => {
    setLoading(true);
    loadWishlistItems();
  }, [user]);

  const value: WishlistContextType = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    itemCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};