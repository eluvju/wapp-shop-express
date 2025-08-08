import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/contexts/ReviewsContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const { user } = useAuth();
  const { submitReview } = useReviews();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRating(0);
    setHoverRating(0);
    setTitle('');
    setComment('');
  }, [productId]);

  if (!user) {
    return (
      <div className="p-4 rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground mb-3">Entre para deixar uma avaliação.</p>
        <Button asChild>
          <a href="/auth">Fazer login</a>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast({ title: 'Selecione uma nota', description: 'A avaliação deve ter pelo menos 1 estrela.' });
      return;
    }
    setSubmitting(true);
    const { error } = await submitReview(productId, rating, title.trim(), comment.trim());
    setSubmitting(false);

    if (error) {
      toast({ title: 'Erro ao enviar avaliação', description: String(error), variant: 'destructive' });
    } else {
      toast({ title: 'Avaliação enviada!', description: 'Obrigado por compartilhar sua opinião.' });
      setRating(0);
      setTitle('');
      setComment('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Sua nota</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = (hoverRating || rating) >= value;
            return (
              <button
                type="button"
                key={value}
                className="p-1"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} estrela${value>1?'s':''}`}
              >
                <Star className={cn('w-6 h-6', active ? 'text-warning fill-current' : 'text-muted-foreground')} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        <Input
          placeholder="Título da sua avaliação (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <Textarea
          placeholder="Conte como foi sua experiência com o produto"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </div>
    </form>
  );
};
