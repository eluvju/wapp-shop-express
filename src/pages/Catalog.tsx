import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductRating } from '@/components/ProductRating';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { Header } from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useReviews } from '@/contexts/ReviewsContext';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { getSummary } = useReviews();

  // Debounce search term
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

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
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.name.localeCompare(a.name); // Fallback to name sorting since created_at doesn't exist
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, debouncedSearchTerm, selectedCategory, priceRange, sortBy]);

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

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setSortBy('name');
    setSearchTerm('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 1000) count++;
    if (sortBy !== 'name') count++;
    return count;
  }, [selectedCategory, priceRange, sortBy]);

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-primary p-8 rounded-2xl text-white mb-6"
          >
            <h1 className="text-4xl font-bold mb-2">Catálogo de Produtos</h1>
            <p className="text-white/90 text-lg">
              Descubra nossos produtos incríveis com qualidade garantida
            </p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {debouncedSearchTerm && ` para "${debouncedSearchTerm}"`}
              {selectedCategory !== 'all' && ` na categoria "${selectedCategory}"`}
            </p>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} w-full lg:w-80 flex-shrink-0`}>
            <div className="sticky top-24">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onClearFilters={handleClearFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros ou buscar por algo diferente
                </p>
                <Button 
                  onClick={handleClearFilters}
                  className="bg-gradient-primary"
                >
                  Limpar filtros
                </Button>
              </motion.div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              }>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={setSelectedProduct}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{selectedProduct.category}</Badge>
                    <DialogTitle className="text-2xl">
                      {selectedProduct.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <ProductImageGallery
                    images={[selectedProduct.image_url]}
                    productName={selectedProduct.name}
                  />
                </div>
                
                {/* Product Info */}
                <div className="space-y-6">
                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    {selectedProduct && (
                      <>
                        <ProductRating rating={getSummary(selectedProduct.id).average} reviewCount={getSummary(selectedProduct.id).count} size="md" />
                        <span className="text-sm text-muted-foreground">{getSummary(selectedProduct.id).average} de 5 estrelas</span>
                      </>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="space-y-2">
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {formatPrice(selectedProduct.price)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Preço com desconto à vista ou parcelado
                    </p>
                  </div>

                  <Separator />
                  
                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Descrição do Produto</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Características</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Produto com garantia de qualidade</li>
                      <li>• Entrega rápida e segura</li>
                      <li>• Suporte técnico especializado</li>
                      <li>• Satisfação garantida</li>
                    </ul>
                  </div>

                  {/* Reviews */}
                  <Separator />
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Avaliações</h3>
                    <ReviewsList productId={selectedProduct.id} />
                    <ReviewForm productId={selectedProduct.id} />
                  </div>
                  <Separator />

                  {/* Add to Cart */}
                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-medium hover:shadow-large"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm">
                        💬 Dúvidas? WhatsApp
                      </Button>
                      <Button variant="outline" size="sm">
                        ❤️ Adicionar aos Favoritos
                      </Button>
                    </div>
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