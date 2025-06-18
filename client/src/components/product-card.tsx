import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  imageUrl?: string;
  categoryId: number;
  rating: string;
  reviewCount: number;
  price: string;
  b2bPrice?: string;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  viewMode?: "grid" | "list";
  showB2BPrice?: boolean;
  hidePrice?: boolean;
}

export default function ProductCard({ product, viewMode = "grid", showB2BPrice = false }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const b2cPrice = parseFloat(product.price);
  const b2bPrice = product.b2bPrice ? parseFloat(product.b2bPrice) : null;
  const displayPrice = showB2BPrice && b2bPrice ? b2bPrice : b2cPrice;
  const displayRating = parseFloat(product.rating);

  const cardClass = viewMode === "list" 
    ? "group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 flex flex-row"
    : "group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200";

  const imageClass = viewMode === "list"
    ? "w-32 h-32 md:w-48 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
    : "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300";

  const contentClass = viewMode === "list" ? "p-4 flex-1" : "p-4";

  return (
    <Card className={cardClass}>
      <Link href={`/products/${product.slug}`}>
        <div className={`relative overflow-hidden ${viewMode === "list" ? "flex-shrink-0" : ""}`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={imageClass}
            />
          ) : (
            <div className={`${viewMode === "list" ? "w-32 h-32 md:w-48 md:h-32" : "w-full h-48"} bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center`}>
              <span className="text-amber-600 font-semibold text-xs md:text-sm">Image à venir</span>
            </div>
          )}

          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-xs">
              Vedette
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className={contentClass}>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-base md:text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className={`flex ${viewMode === "list" ? "flex-col md:flex-row" : "flex-col"} items-start ${viewMode === "list" ? "md:items-center" : ""} justify-between mb-4 space-y-2 md:space-y-0`}>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              {displayPrice.toLocaleString()} CFA
            </span>
            {!showB2BPrice && b2bPrice && b2bPrice < b2cPrice && (
              <span className="text-xs text-amber-600 font-medium">
                Réduction Pro disponible
              </span>
            )}
            {showB2BPrice && b2bPrice && b2bPrice < b2cPrice && (
              <span className="text-xs text-gray-500 line-through">
                {b2cPrice.toLocaleString()} CFA
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {displayRating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm md:text-base"
          size={viewMode === "list" ? "sm" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ajouter au panier
        </Button>
      </CardContent>
    </Card>
  );
}