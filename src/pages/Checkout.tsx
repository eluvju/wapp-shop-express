import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido')
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: ''
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const generateWhatsAppMessage = (data: CheckoutForm) => {
    const header = '🛒 NOVO PEDIDO - STG CATALOG';
    const customer = `👤 Cliente: ${data.name}`;
    const email = `📧 Email: ${data.email}`;
    
    const products = items.map(item => 
      `- ${item.product.name} - Qtd: ${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');
    
    const totalLine = `💰 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}`;
    const footer = '---\nPedido via STG Catalog';
    
    return `${header}\n${customer}\n${email}\n📦 PRODUTOS:\n${products}\n${totalLine}\n${footer}`;
  };

  const handleSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    
    try {
      // Generate WhatsApp message
      const message = generateWhatsAppMessage(data);
      const encodedMessage = encodeURIComponent(message);
      
      // For demo purposes, using a placeholder number
      // In production, this should be configurable
      const whatsappNumber = '5511999999999'; // Replace with actual business number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Clear cart
      await clearCart();
      
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado via WhatsApp. Aguarde o contato!"
      });
      
      // Redirect to catalog
      navigate('/');
      
    } catch (error) {
      console.error('Error sending order:', error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/cart')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Seu nome completo"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="seu@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      placeholder="(11) 99999-9999"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Finalização via WhatsApp</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ao finalizar, você será redirecionado para o WhatsApp com o resumo do seu pedido. 
                      Nossa equipe entrará em contato para confirmar detalhes de entrega e pagamento.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Finalizar via WhatsApp'}
                    <MessageCircle className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.name}</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.product.category}
                        </Badge>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">
                            Qtd: {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Importante:</strong> O pagamento e entrega serão combinados via WhatsApp 
                    após o envio do pedido.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};