import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { Header } from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return uniqueCategories.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          searchTerm=""
          onSearchChange={() => {}}
          selectedCategory="all"
          onCategoryChange={() => {}}
          categories={[]}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gradient-primary rounded-lg mb-4 animate-pulse" />
            <div className="h-4 bg-muted rounded-md w-1/3 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-primary p-8 rounded-2xl text-white mb-6">
            <h1 className="text-4xl font-bold mb-2">Catálogo de Produtos</h1>
            <p className="text-white/90 text-lg">
              Descubra nossos produtos incríveis com qualidade garantida
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
              {selectedCategory !== 'all' && ` na categoria "${selectedCategory}"`}
            </p>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar seus filtros ou buscar por algo diferente
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-primary"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary">{selectedProduct.category}</Badge>
                  <DialogTitle className="text-xl flex-1">
                    {selectedProduct.name}
                  </DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(selectedProduct.price)}
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="px-8"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};