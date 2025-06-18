import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "./cart-sidebar";
import {
  Menu,
  Phone,
  Mail,
  User,
  ShoppingCart,
  ChevronDown,
  LogOut,
  LogIn
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const categories: Category[] = [
  { id: 1, name: "Spiritueux", slug: "spiritueux" },
  { id: 2, name: "Jus Naturels", slug: "jus-naturels" },
  { id: 3, name: "Cigares", slug: "cigares" },
  { id: 4, name: "Accessoires", slug: "accessoires" },
];

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as any;
  const { cartSummary } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-ivorian-black text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="flex items-center justify-center sm:justify-start">
                  <Phone className="h-3 w-3 mr-1" />
                  +225 01 72 10 68 68
                </span>
                <span className="flex items-center justify-center sm:justify-start">
                  <Mail className="h-3 w-3 mr-1" />
                  info@barelle-distribution.com
                </span>
              </div>
              <div className="flex space-x-4">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-ivorian-yellow hover:bg-transparent"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {typedUser?.firstName || 'Utilisateur'} {typedUser?.lastName || ''}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Mon Profil
                        </Link>
                      </DropdownMenuItem>
                      {(typedUser?.role === 'admin' || typedUser?.role === 'support') && (
                        <DropdownMenuItem>
                          <Link href="/admin">
                            <User className="h-4 w-4 mr-2" />
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <a href="/api/logout" className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Se Déconnecter
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-ivorian-yellow hover:bg-transparent"
                      asChild
                    >
                      <a href="/api/login">
                        <LogIn className="h-3 w-3 mr-1" />
                        Se Connecter
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-ivorian-yellow hover:bg-transparent"
                      asChild
                    >
                      <Link href="/register">
                        <User className="h-3 w-3 mr-1" />
                        S'inscrire
                      </Link>
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-ivorian-yellow hover:bg-transparent relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Panier ({cartSummary.itemCount})
                  {cartSummary.itemCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 bg-ivorian-yellow text-ivorian-black text-xs h-5 w-5 flex items-center justify-center p-0"
                    >
                      {cartSummary.itemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="py-2 sm:py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                  <img
                    src="/icons/logo.png"
                    alt="Barelle Distribution"
                    className="h-[60px] w-[120px] sm:h-[80px] sm:w-[150px]"
                  />
                  <span className="sr-only">Barelle Distribution</span>
                </Link>
                <p className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600 hidden md:block">
                  Produits 100% Ivoiriens
                </p>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8">
                <Link
                  href="/"
                  className={`font-medium transition-colors ${location === "/"
                    ? "text-ivorian-amber"
                    : "text-ivorian-black hover:text-ivorian-amber"
                    }`}
                >
                  Accueil
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-ivorian-black hover:text-ivorian-amber font-medium p-0 h-auto"
                    >
                      Produits <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.id}>
                        <Link href={`/products?category=${category.slug}`}>
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {isAuthenticated && (
                  <Link
                    href="/profile"
                    className={`font-medium transition-colors ${location === "/profile"
                      ? "text-ivorian-amber"
                      : "text-ivorian-black hover:text-ivorian-amber"
                      }`}
                  >
                    Mon Espace B2B
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    <SheetClose asChild>
                      <Link href="/" className="text-lg font-medium">
                        Accueil
                      </Link>
                    </SheetClose>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Produits</h3>
                      {categories.map((category) => (
                        <SheetClose key={category.id} asChild>
                          <Link
                            href={`/products?category=${category.slug}`}
                            className="block pl-4 text-gray-600 hover:text-ivorian-amber"
                          >
                            {category.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>

                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Link href="/profile" className="text-lg font-medium">
                            Mon Espace B2B
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <a href="/api/logout" className="text-lg font-medium flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            Se Déconnecter
                          </a>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <a href="/api/login" className="text-lg font-medium flex items-center">
                            <LogIn className="h-4 w-4 mr-2" />
                            Se Connecter
                          </a>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register" className="text-lg font-medium flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            S'inscrire
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}