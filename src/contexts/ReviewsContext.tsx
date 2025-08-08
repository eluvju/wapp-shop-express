import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean | null;
  is_approved: boolean | null;
  helpful_count: number | null;
  created_at: string;
  updated_at?: string;
}

interface ReviewsContextType {
  getReviews: (productId: string) => ProductReview[];
  loading: boolean;
  refreshReviews: (productId: string) => Promise<void>;
  getSummary: (productId: string) => { average: number; count: number };
  submitReview: (productId: string, rating: number, title: string, comment: string) => Promise<{ error?: any }>
  incrementHelpful: (reviewId: string) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
};

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [byProduct, setByProduct] = useState<Record<string, ProductReview[]>>({});
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id, product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count, created_at, updated_at')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setByProduct(prev => ({ ...prev, [productId]: data as ProductReview[] }));
    } catch (e) {
      console.error('Error loading reviews', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = (productId: string) => byProduct[productId] || [];

  const refreshReviews = async (productId: string) => {
    await loadReviews(productId);
  };

  const getSummary = (productId: string) => {
    const list = byProduct[productId] || [];
    const count = list.length;
    const average = count > 0 ? list.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;
    return { average: Number(average.toFixed(1)), count };
  };

  const submitReview: ReviewsContextType['submitReview'] = async (productId, rating, title, comment) => {
    if (!user) return { error: 'not_authenticated' };

    try {
      const { error } = await supabase
        .from('product_reviews')
        .upsert({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          comment,
          is_verified_purchase: false,
          is_approved: true,
        }, { onConflict: 'product_id,user_id' });

      if (error) return { error };
      await loadReviews(productId);
      return {};
    } catch (e) {
      return { error: e };
    }
  };

  const incrementHelpful = async (reviewId: string) => {
    // Minimal optimistic update without vote tracking
    const productId = Object.keys(byProduct).find(pid => (byProduct[pid] || []).some(r => r.id === reviewId));
    if (productId) {
      setByProduct(prev => ({
        ...prev,
        [productId]: (prev[productId] || []).map(r => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r)
      }));
    }

    try {
      // Fetch current value to avoid server-side arithmetic (no RPC)
      const { data, error } = await supabase
        .from('product_reviews')
        .select('helpful_count, product_id')
        .eq('id', reviewId)
        .single();

      if (error) throw error;

      const newValue = ((data?.helpful_count as number) || 0) + 1;
      await supabase
        .from('product_reviews')
        .update({ helpful_count: newValue })
        .eq('id', reviewId);

      if (data?.product_id) await loadReviews(data.product_id as string);
    } catch (e) {
      console.error('Error incrementing helpful count', e);
    }
  };

  const value: ReviewsContextType = useMemo(() => ({
    getReviews,
    loading,
    refreshReviews,
    getSummary,
    submitReview,
    incrementHelpful,
  }), [getReviews, loading, refreshReviews, getSummary, submitReview, incrementHelpful]);

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
};
