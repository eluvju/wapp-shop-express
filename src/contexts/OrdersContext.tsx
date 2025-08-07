import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useAppState } from './AppStateContext';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    category: string;
  };
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  discount_amount: number;
  shipping_cost: number;
  coupon_code?: string;
  shipping_address: any;
  billing_address?: any;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'> & { items: Omit<OrderItem, 'id' | 'product'>[] }) => Promise<Order | null>;
  getOrder: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

interface OrdersProviderProps {
  children: ReactNode;
}

export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNotification, addError } = useAppState();

  // Load orders
  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:products (
              id,
              name,
              image_url,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
      addError('Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'> & { items: Omit<OrderItem, 'id' | 'product'>[] }): Promise<Order | null> => {
    if (!user) {
      addError('Usuário não autenticado');
      return null;
    }

    try {
      // Create order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: orderData.status,
          total_amount: orderData.total_amount,
          discount_amount: orderData.discount_amount,
          shipping_cost: orderData.shipping_cost,
          coupon_code: orderData.coupon_code,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderResult.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Reload orders to get the complete data
      await loadOrders();

      addNotification({
        type: 'success',
        title: 'Pedido criado',
        message: `Pedido #${orderResult.id.slice(0, 8)} foi criado com sucesso`
      });

      return { ...orderResult, items: [] } as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      addError('Erro ao criar pedido');
      return null;
    }
  };

  // Get order by ID
  const getOrder = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));

      addNotification({
        type: 'info',
        title: 'Status atualizado',
        message: `Status do pedido foi atualizado para ${status}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      addError('Erro ao atualizar status do pedido');
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    setLoading(true);
    await loadOrders();
  };

  // Load orders when user changes
  useEffect(() => {
    loadOrders();
  }, [user]);

  const value: OrdersContextType = {
    orders,
    loading,
    createOrder,
    getOrder,
    updateOrderStatus,
    refreshOrders
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};