import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrdersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package } from 'lucide-react';

export const Orders: React.FC = () => {
  const { orders, loading } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Histórico de Pedidos | STG Catalog';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Veja o histórico e detalhes dos seus pedidos no STG Catalog.');
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Veja o histórico e detalhes dos seus pedidos no STG Catalog.';
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

  const statusVariant = (status: string): 'secondary' | 'default' | 'destructive' | 'outline' => {
    switch (status) {
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      case 'confirmed':
      case 'processing':
      case 'shipped': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}> 
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Histórico de Pedidos</h1>

        {orders.length === 0 ? (
          <Card className="text-center p-8 border-0 shadow-medium">
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <Package className="w-10 h-10 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Você ainda não tem pedidos</h2>
                <p className="text-muted-foreground">Explore o catálogo e faça seu primeiro pedido</p>
                <Button onClick={() => navigate('/catalog')}>Ir para o catálogo</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-medium">
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.items?.length || 0} itens
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={item.product.image_url} alt={`Imagem do produto ${item.product.name}`} className="w-12 h-12 rounded object-cover" loading="lazy" />
                          <div className="truncate">
                            <div className="font-medium truncate">{item.product.name}</div>
                            <div className="text-muted-foreground">Qtd: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-medium">{formatPrice(item.total_price)}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-1 text-sm">
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Desconto {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                        <span>- {formatPrice(Number(order.discount_amount))}</span>
                      </div>
                    )}
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span>{formatPrice(Number(order.shipping_cost))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(Number(order.total_amount))}</span>
                    </div>
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

export default Orders;
