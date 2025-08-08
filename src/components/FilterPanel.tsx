import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  priceMin?: number;
  priceMax?: number;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  priceMin = 0,
  priceMax = 1000,
  sortBy,
  onSortByChange,
  onClearFilters,
  activeFiltersCount
}) => {
  const sortOptions = [
    { value: 'name', label: 'Nome A-Z' },
    { value: 'price-asc', label: 'Menor Preço' },
    { value: 'price-desc', label: 'Maior Preço' },
    { value: 'newest', label: 'Mais Recentes' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Categorias
          </h4>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => onCategoryChange('all')}
            >
              Todas as categorias
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Faixa de Preço
          </h4>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              max={priceMax}
              min={priceMin}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Ordenar por
          </h4>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => onSortByChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};