import { useMemo, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';

export const useOptimizedCart = () => {
  const cart = useCart();

  // Memoized total calculation
  const total = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart.items]);

  // Memoized item count
  const itemCount = useMemo(() => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }, [cart.items]);

  // Memoized cart summary
  const cartSummary = useMemo(() => ({
    total,
    itemCount,
    isEmpty: cart.items.length === 0,
    uniqueProducts: cart.items.length
  }), [total, itemCount, cart.items.length]);

  // Optimized add to cart with quantity check
  const addToCartOptimized = useCallback(async (product: any, quantity = 1) => {
    const existingItem = cart.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      await cart.updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      await cart.addToCart(product, quantity);
    }
  }, [cart.items, cart.addToCart, cart.updateQuantity]);

  // Batch operations
  const batchUpdateQuantities = useCallback(async (updates: { productId: string; quantity: number }[]) => {
    const promises = updates.map(update => 
      cart.updateQuantity(update.productId, update.quantity)
    );
    await Promise.all(promises);
  }, [cart.updateQuantity]);

  return {
    ...cart,
    total,
    itemCount,
    cartSummary,
    addToCartOptimized,
    batchUpdateQuantities
  };
};