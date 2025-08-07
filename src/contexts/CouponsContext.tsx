import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppState } from './AppStateContext';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_order_amount: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

interface CouponValidation {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
  discount?: number;
}

interface CouponsContextType {
  coupons: Coupon[];
  loading: boolean;
  validateCoupon: (code: string, orderAmount: number) => Promise<CouponValidation>;
  applyCoupon: (code: string, orderAmount: number) => Promise<CouponValidation>;
  calculateDiscount: (coupon: Coupon, orderAmount: number) => number;
  refreshCoupons: () => Promise<void>;
}

const CouponsContext = createContext<CouponsContextType | undefined>(undefined);

export const useCoupons = () => {
  const context = useContext(CouponsContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponsProvider');
  }
  return context;
};

interface CouponsProviderProps {
  children: ReactNode;
}

export const CouponsProvider: React.FC<CouponsProviderProps> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { addError } = useAppState();

  // Load active coupons
  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCoupons((data || []) as Coupon[]);
    } catch (error) {
      console.error('Error loading coupons:', error);
      addError('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount amount
  const calculateDiscount = (coupon: Coupon, orderAmount: number): number => {
    switch (coupon.type) {
      case 'percentage':
        return (orderAmount * coupon.value) / 100;
      case 'fixed_amount':
        return Math.min(coupon.value, orderAmount);
      case 'free_shipping':
        return 0; // Shipping discount handled separately
      default:
        return 0;
    }
  };

  // Validate coupon
  const validateCoupon = async (code: string, orderAmount: number): Promise<CouponValidation> => {
    if (!code.trim()) {
      return { isValid: false, error: 'Código do cupom é obrigatório' };
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, error: 'Cupom não encontrado ou inválido' };
      }

      const coupon = data as Coupon;

      // Check if coupon is still valid (date range)
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom) {
        return { isValid: false, error: 'Cupom ainda não é válido' };
      }

      if (validUntil && now > validUntil) {
        return { isValid: false, error: 'Cupom expirado' };
      }

      // Check minimum order amount
      if (orderAmount < coupon.minimum_order_amount) {
        return { 
          isValid: false, 
          error: `Valor mínimo do pedido: R$ ${coupon.minimum_order_amount.toFixed(2)}` 
        };
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { isValid: false, error: 'Cupom esgotado' };
      }

      const discount = calculateDiscount(coupon, orderAmount);

      return {
        isValid: true,
        coupon,
        discount
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { isValid: false, error: 'Erro ao validar cupom' };
    }
  };

  // Apply coupon (validate and increment usage)
  const applyCoupon = async (code: string, orderAmount: number): Promise<CouponValidation> => {
    const validation = await validateCoupon(code, orderAmount);
    
    if (!validation.isValid || !validation.coupon) {
      return validation;
    }

    try {
      // Increment usage count
      const { error } = await supabase
        .from('coupons')
        .update({ used_count: validation.coupon.used_count + 1 })
        .eq('id', validation.coupon.id);

      if (error) throw error;

      return validation;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { isValid: false, error: 'Erro ao aplicar cupom' };
    }
  };

  // Refresh coupons
  const refreshCoupons = async () => {
    setLoading(true);
    await loadCoupons();
  };

  // Load coupons on mount
  useEffect(() => {
    loadCoupons();
  }, []);

  const value: CouponsContextType = {
    coupons,
    loading,
    validateCoupon,
    applyCoupon,
    calculateDiscount,
    refreshCoupons
  };

  return (
    <CouponsContext.Provider value={value}>
      {children}
    </CouponsContext.Provider>
  );
};