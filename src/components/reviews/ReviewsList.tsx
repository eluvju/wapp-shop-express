import React, { useEffect } from 'react';
import { useReviews } from '@/contexts/ReviewsContext';
import { Button } from '@/components/ui/button';
import { ProductRating } from '@/components/ProductRating';
import { ThumbsUp } from 'lucide-react';

interface ReviewsListProps {
  productId: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ productId }) => {
  const { getReviews, refreshReviews, getSummary, incrementHelpful } = useReviews();
  const reviews = getReviews(productId);
  const { average, count } = getSummary(productId);

  useEffect(() => {
    refreshReviews(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <ProductRating rating={average} reviewCount={count} />
          <span className="text-sm text-muted-foreground">Média baseada em {count} avaliação{count!==1?'es':''}</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há avaliações para este produto.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between gap-3">
                <ProductRating rating={r.rating} showReviewCount={false} />
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {r.title && <h4 className="font-medium mt-2">{r.title}</h4>}
              {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => incrementHelpful(r.id)}>
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Útil ({r.helpful_count ?? 0})
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
