import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  b2bPrice?: string;
  originalPrice?: string;
  imageUrl?: string;
  rating?: string;
  reviewCount?: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as any;

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity: 1 });
  };

  // Déterminer le prix à afficher selon le type d'utilisateur
  const getDisplayPrice = () => {
    if (isAuthenticated && typedUser?.isB2B && product.b2bPrice) {
      return parseFloat(product.b2bPrice);
    }
    return parseFloat(product.price);
  };

  const getOriginalPrice = () => {
    if (isAuthenticated && typedUser?.isB2B && product.b2bPrice) {
      return parseFloat(product.price); // Le prix B2C devient le prix barré pour les B2B
    }
    return product.originalPrice ? parseFloat(product.originalPrice) : null;
  };

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white w-full max-w-sm mx-auto">
      <div className="aspect-square relative overflow-hidden"
        style={{ 
          minHeight: "200px",
          maxHeight: "300px"
        }}
      >
        <img
          src={product.imageUrl || "/placeholder-product.jpg"}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-ivorian-yellow text-ivorian-black">
            <Star className="w-3 h-3 mr-1" />
            Vedette
          </Badge>
        )}
        {!isAuthenticated && product.b2bPrice && (
          <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
            Réduction Pro
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
          {product.name}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-ivorian-amber">
              {displayPrice.toLocaleString()} CFA
              {isAuthenticated && typedUser?.isB2B && (
                <span className="text-xs text-blue-600 ml-1 sm:ml-2">Prix B2B</span>
              )}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString()} CFA
              </span>
            )}
            {!isAuthenticated && product.b2bPrice && (
              <span className="text-xs text-blue-600">
                Réduction disponible pour les professionnels
              </span>
            )}
          </div>

          {product.rating && (
            <div className="flex items-center mt-1 sm:mt-0">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm text-gray-600 ml-1">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-ivorian-amber hover:bg-ivorian-yellow text-ivorian-black font-medium text-sm sm:text-base py-2 sm:py-3"
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Ajouter au Panier</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </CardContent>
    </Card>
  );
}