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
  const { cartSummary } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-ivorian-black text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-4">
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  +225 XX XX XX XX
                </span>
                <span className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  contact@barelle-distribution.ci
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
                        {user.firstName} {user.lastName}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Mon Profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <a href="/api/logout" className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Se Déconnecter
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:text-ivorian-yellow hover:bg-transparent"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Espace Pro B2B
                  </Button>
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
        <div className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/">
                  <h1 className="text-2xl font-bold text-ivorian-black">
                    Barelle <span className="text-ivorian-amber">Distribution</span>
                  </h1>
                </Link>
                <p className="ml-3 text-sm text-gray-600 hidden md:block">
                  Produits 100% Ivoiriens
                </p>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8">
                <Link 
                  href="/" 
                  className={`font-medium transition-colors ${
                    location === "/" 
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
                    className={`font-medium transition-colors ${
                      location === "/profile" 
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
                      <SheetClose asChild>
                        <a href="/api/login" className="text-lg font-medium flex items-center">
                          <LogIn className="h-4 w-4 mr-2" />
                          Se Connecter
                        </a>
                      </SheetClose>
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