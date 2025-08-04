-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens do carrinho
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (leitura pública)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Políticas para cart_items (usuários só veem seus próprios itens)
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Popular com 20 produtos
INSERT INTO public.products (name, description, price, image_url, category) VALUES
('Laptop Gamer Alienware', 'Notebook high-end para jogos com placa de vídeo RTX 4080, processador Intel i9 e 32GB RAM', 8999.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop', 'Tecnologia'),
('iPhone 15 Pro Max', 'Smartphone Apple premium com câmera de 48MP, chip A17 Pro e tela de 6.7 polegadas', 7299.00, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop', 'Tecnologia'),
('Samsung Galaxy S24 Ultra', 'Smartphone Android topo de linha com S Pen, câmera de 200MP e tela Dynamic AMOLED', 6499.00, 'https://images.unsplash.com/photo-1610792516286-524726503fb2?w=500&h=500&fit=crop', 'Tecnologia'),
('MacBook Air M3', 'Notebook Apple para produtividade com chip M3, 16GB RAM e tela Liquid Retina de 13.6"', 9999.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop', 'Tecnologia'),
('PlayStation 5', 'Console de videogame Sony com SSD ultra-rápido, ray tracing e jogos em 4K', 4299.00, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop', 'Tecnologia'),
('Xbox Series X', 'Console Microsoft 4K com Quick Resume, Smart Delivery e retrocompatibilidade', 4599.00, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&h=500&fit=crop', 'Tecnologia'),
('Apple Watch Series 9', 'Smartwatch Apple com GPS, monitoramento de saúde e tela Always-On Retina', 3299.00, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop', 'Tecnologia'),
('AirPods Pro 2', 'Fones sem fio com cancelamento de ruído ativo, áudio espacial e case MagSafe', 2099.00, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop', 'Tecnologia'),
('Smart TV 65" QLED Samsung', 'TV 4K com tecnologia QLED, HDR10+ e sistema operacional Tizen', 5499.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop', 'Casa'),
('Geladeira French Door Brastemp', 'Geladeira premium 540L com freezer duplo, dispensador de água e controle digital', 4799.00, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&h=500&fit=crop', 'Casa'),
('Ar Condicionado Split Inverter', 'Climatizador 12.000 BTUs com tecnologia inverter, Wi-Fi e controle por app', 2899.00, 'https://images.unsplash.com/photo-1631545806605-1ca8b97a0e19?w=500&h=500&fit=crop', 'Casa'),
('Sofá 3 Lugares Retrátil', 'Sofá cinza moderno e confortável com mecanismo retrátil e tecido suede', 2499.00, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop', 'Casa'),
('Tênis Nike Air Jordan', 'Calçado esportivo premium com tecnologia Air, design icônico e máximo conforto', 899.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'Moda'),
('Relógio Fossil Smartwatch', 'Relógio inteligente elegante com Wear OS, GPS e monitoramento fitness', 1299.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', 'Moda'),
('Bolsa Louis Vuitton', 'Bolsa feminina de luxo em couro legítimo com design clássico e alça ajustável', 3599.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop', 'Moda'),
('Óculos Ray-Ban Aviador', 'Óculos de sol clássico com lentes polarizadas, proteção UV e armação dourada', 599.00, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop', 'Moda'),
('Bicicleta Mountain Bike', 'Bike aro 29 para trilhas com suspensão dianteira, 21 marchas e freios a disco', 1899.00, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop', 'Esporte'),
('Drone DJI Mini 4K', 'Drone compacto com câmera 4K, gimbal de 3 eixos e autonomia de 30 minutos', 2799.00, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop', 'Esporte'),
('Kit Academia Completo', 'Equipamentos para exercícios em casa: halteres, colchonete, elásticos e barra', 1499.00, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop', 'Esporte'),
('Prancha de Surf Profissional', 'Prancha 6''2" para surfistas intermediários e avançados, construção em fibra de vidro', 1199.00, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=500&fit=crop', 'Esporte');