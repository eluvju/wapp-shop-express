import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
          >
            STG CATALOG
          </h1>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Olá, {user.user_metadata?.name || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};