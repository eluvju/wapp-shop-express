import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { CouponsProvider } from "@/contexts/CouponsContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Catalog } from "./pages/Catalog";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import React from "react";
import { AnimatePresence } from "framer-motion";

const OrdersPage = React.lazy(() => import('./pages/Orders'));
const WishlistPage = React.lazy(() => import('./pages/Wishlist'));

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Catalog />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppStateProvider>
          <TooltipProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrdersProvider>
                    <CouponsProvider>
                      <ReviewsProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
                            <AnimatedRoutes />
                          </React.Suspense>
                        </BrowserRouter>
                      </ReviewsProvider>
                    </CouponsProvider>
                  </OrdersProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </TooltipProvider>
        </AppStateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
