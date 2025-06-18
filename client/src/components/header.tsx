import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Menu, X, User, LogOut, ArrowLeft } from "lucide-react";
import CartSidebar from "./cart-sidebar";
import { useLocation } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const cartItemsCount = cartItems?.length || 0;

  const handleBack = () => {
    window.history.back();
  };

  const showBackButton = location !== "/" && location !== "/products";

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Back button and Logo */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <a href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">B</span>
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900">
                  Barelle Distribution
                </span>
              </a>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-amber-600 transition-colors">
                Accueil
              </a>
              <a href="/products" className="text-gray-700 hover:text-amber-600 transition-colors">
                Produits
              </a>
              {user?.role === 'admin' && (
                <a href="/admin" className="text-gray-700 hover:text-amber-600 transition-colors">
                  Administration
                </a>
              )}
              {user?.isB2B && (
                <>
                  <a href="/profile" className="text-gray-700 hover:text-amber-600 transition-colors">
                    Mon Profil
                  </a>
                  <a href="/orders" className="text-gray-700 hover:text-amber-600 transition-colors">
                    Mes Commandes
                  </a>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-500 text-white text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Bonjour, {user?.firstName}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <a href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </a>
                  <a href="/auth/register">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      S'inscrire
                    </Button>
                  </a>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-4 space-y-3">
                <a href="/" className="block text-gray-700 hover:text-amber-600 transition-colors">
                  Accueil
                </a>
                <a href="/products" className="block text-gray-700 hover:text-amber-600 transition-colors">
                  Produits
                </a>
                {user?.role === 'admin' && (
                  <a href="/admin" className="block text-gray-700 hover:text-amber-600 transition-colors">
                    Administration
                  </a>
                )}
                {user?.isB2B && (
                  <>
                    <a href="/profile" className="block text-gray-700 hover:text-amber-600 transition-colors">
                      Mon Profil
                    </a>
                    <a href="/orders" className="block text-gray-700 hover:text-amber-600 transition-colors">
                      Mes Commandes
                    </a>
                  </>
                )}

                {isAuthenticated ? (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Connecté en tant que {user?.firstName}
                    </p>
                    <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <div className="border-t pt-3 space-y-2">
                    <a href="/auth/login" className="block">
                      <Button variant="ghost" size="sm" className="w-full">
                        Connexion
                      </Button>
                    </a>
                    <a href="/auth/register" className="block">
                      <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                        S'inscrire
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}