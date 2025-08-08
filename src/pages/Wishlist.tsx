import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Lista de Desejos | STG Catalog';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Gerencie sua lista de desejos no STG Catalog.');
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Gerencie sua lista de desejos no STG Catalog.';
      document.head.appendChild(m);
    }

    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) link.href = window.location.href; else {
      const l = document.createElement('link');
      l.rel = 'canonical';
      l.href = window.location.href;
      document.head.appendChild(l);
    }
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const moveToCart = async (product: any) => {
    await addToCart(product, 1);
    await removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}> 
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Lista de Desejos</h1>

        {items.length === 0 ? (
          <Card className="text-center p-8 border-0 shadow-medium">
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <Heart className="w-10 h-10 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Sua lista está vazia</h2>
                <p className="text-muted-foreground">Explore o catálogo e adicione seus produtos favoritos</p>
                <Button onClick={() => navigate('/')}>Ir para o catálogo</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-0 shadow-medium">
                <div className="h-44 w-full overflow-hidden">
                  <img src={item.product.image_url} alt={`Imagem do produto ${item.product.name}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold leading-tight">{item.product.name}</h3>
                      <Badge variant="secondary" className="mt-1">{item.product.category}</Badge>
                    </div>
                    <div className="font-semibold whitespace-nowrap">{formatPrice(item.product.price)}</div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => removeFromWishlist(item.product.id)}>Remover</Button>
                    <Button onClick={() => moveToCart(item.product)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Carrinho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
