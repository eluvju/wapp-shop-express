import React from 'react';
import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showReviewCount?: boolean;
}

export const ProductRating: React.FC<ProductRatingProps> = ({
  rating,
  reviewCount = 0,
  size = 'md',
  showReviewCount = true
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${sizes[size]} text-warning fill-current`}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${sizes[size]} text-muted-foreground`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${sizes[size]} text-warning fill-current`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={`${sizes[size]} text-muted-foreground`}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>
      {showReviewCount && (
        <span className={`${textSizes[size]} text-muted-foreground`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};