import React from 'react';
import { Product } from '@/contexts/CartContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card 
      className="group cursor-pointer card-hover overflow-hidden border-0 shadow-soft hover:shadow-large bg-card"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm border-0 shadow-medium"
        >
          {product.category}
        </Badge>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-soft hover:shadow-medium border-0"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
};