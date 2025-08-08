import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, User, LogOut, Heart, Package, BadgePercent, Tag, Store } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
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
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleKeyActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      (e.currentTarget as HTMLDivElement).click();
      e.preventDefault();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Header fixa no fluxo da página (sem retração/retorno no scroll)

  return (
    <header className={"w-full border-b header-surface"}>
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
                <span className="text-sm opacity-90">
                  Olá, {user.user_metadata?.name || user.email}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={handleKeyActivate}
                      onClick={handleSignOut}
                      aria-label="Sair"
                      title="Sair"
                      className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                    >
                      <LogOut />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Sair</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyActivate}
                    onClick={() => navigate('/auth')}
                    aria-label="Entrar"
                    title="Entrar"
                    className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                  >
                    <User />
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Entrar</TooltipContent>
              </Tooltip>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyActivate}
                    onClick={() => navigate('/orders')}
                    aria-label="Pedidos"
                    title="Pedidos"
                    className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                  >
                    <Package />
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Pedidos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyActivate}
                    className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                    onClick={() => navigate('/wishlist')}
                    aria-label="Favoritos"
                    title="Favoritos"
                  >
                    <Heart />
                    {wishlistCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Favoritos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyActivate}
                    className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                    onClick={() => navigate('/cart')}
                    aria-label="Carrinho"
                    title="Carrinho"
                  >
                    <ShoppingCart />
                    {itemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Carrinho</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchAutocomplete
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-48 bg-background text-foreground border-0 shadow-soft">
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

        {/* Barra de atalho estilo marketplace (inspirado no Mercado Livre) */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [&>div_button]:mx-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyActivate}
                onClick={() => navigate('/')}
                className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                aria-label="Ofertas"
                title="Ofertas"
              >
                <Tag />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Ofertas</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyActivate}
                onClick={() => navigate('/')}
                className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                aria-label="Cupons"
                title="Cupons"
              >
                <BadgePercent />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Cupons</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyActivate}
                onClick={() => navigate('/')}
                className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
                aria-label="Supermercado"
                title="Supermercado"
              >
                <Store />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Supermercado</TooltipContent>
          </Tooltip>

          <Badge variant="secondary" className="ml-1 whitespace-nowrap">
            Frete grátis a partir de R$ 19
          </Badge>
        </div>
      </div>
    </header>
  );
};