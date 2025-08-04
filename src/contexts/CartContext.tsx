import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart items when user logs in
  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      // Load from localStorage for anonymous users
      loadLocalCart();
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedItems: CartItem[] = cartItems?.map(item => ({
        id: item.id,
        product: item.product as Product,
        quantity: item.quantity
      })) || [];

      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
  };

  const saveLocalCart = (newItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      // Handle anonymous users with localStorage
      const existingItem = items.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...items, { id: Date.now().toString(), product, quantity }];
      }
      
      setItems(newItems);
      saveLocalCart(newItems);
      toast({ title: "Produto adicionado ao carrinho!" });
      return;
    }

    setLoading(true);
    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity
          });
        
        if (error) throw error;
      }

      await loadCartItems();
      toast({ title: "Produto adicionado ao carrinho!" });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ title: "Erro ao adicionar produto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!user) {
      const newItems = items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      setItems(newItems);
      saveLocalCart(newItems);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({ title: "Erro ao atualizar quantidade", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      const newItems = items.filter(item => item.product.id !== productId);
      setItems(newItems);
      saveLocalCart(newItems);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await loadCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({ title: "Erro ao remover produto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setItems([]);
      localStorage.removeItem('cart');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({ title: "Erro ao limpar carrinho", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};