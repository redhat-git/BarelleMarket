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
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  viewMode?: "grid" | "list";
  showB2BPrice?: boolean;
  hidePrice?: boolean;
}

export default function ProductCard({ 
  product, 
  categoryName,
  viewMode = "grid",
  showB2BPrice = false,
  hidePrice = false
}: ProductCardProps) {
  const { addToCart, isAdding } = useCart();

  const getCategoryColor = (categoryId: number) => {
    switch (categoryId) {
      case 1: // Spiritueux
        return "bg-ivorian-yellow text-ivorian-black";
      case 2: // Jus Naturels
        return "bg-green-500 text-white";
      case 3: // Cigares
        return "bg-amber-700 text-white";
      case 4: // Accessoires
        return "bg-gray-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  const formatPrice = (price: string, isB2B: boolean = false) => {
    const numPrice = parseFloat(price);
    const finalPrice = isB2B ? numPrice * 0.7 : numPrice; // 30% discount for B2B
    return new Intl.NumberFormat('fr-FR').format(finalPrice) + ' XOF';
  };

  const calculateSavings = (price: string) => {
    const numPrice = parseFloat(price);
    const savings = numPrice * 0.3;
    return new Intl.NumberFormat('fr-FR').format(savings) + ' XOF';
  };

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-48 h-48 md:h-32 overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-ivorian-black mb-2 line-clamp-2">
                  {product.name}
                </h4>

                {product.shortDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-3">
                  {product.rating && parseFloat(product.rating) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.reviewCount})</span>
                    </div>
                  )}

                  {product.isFeatured && (
                    <Badge className="bg-ivorian-yellow text-ivorian-black">
                      Populaire
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right flex-shrink-0">
                <div className="mb-3">
                  {showB2BPrice ? (
                    <div>
                      <div className="text-lg font-bold text-ivorian-black">
                        {formatPrice(product.price, true)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price, false)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Économie: {calculateSavings(product.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-ivorian-black">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/products/${product.slug}`}>
                    <Button 
                      variant="ghost" 
                      className="text-ivorian-amber hover:text-ivorian-yellow font-semibold p-0"
                    >
                      Voir Détails
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => addToCart({ productId: product.id })}
                    disabled={isAdding}
                    className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop"}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-semibold ${getCategoryColor(product.categoryId)}`}>
            {categoryName || 'Produit'}
          </Badge>
          <div className="flex items-center">
            {renderStars(parseFloat(product.rating))}
            {product.reviewCount > 0 && (
              <span className="text-gray-600 text-xs ml-1">({product.reviewCount})</span>
            )}
          </div>
        </div>

        <h4 className="text-lg font-bold text-ivorian-black mb-2 line-clamp-2">
          {product.name}
        </h4>

        {product.shortDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link href={`/products/${product.slug}`}>
            <Button 
              variant="ghost" 
              className="text-ivorian-amber hover:text-ivorian-yellow font-semibold p-0"
            >
              Voir Détails
            </Button>
          </Link>

          <div className="mb-2">
            {showB2BPrice ? (
              <div>
                <div className="text-lg font-bold text-ivorian-black">
                  {formatPrice(product.price, true)}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price, false)}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  -30% B2B
                </div>
              </div>
            ) : (
              !hidePrice && (
                <div className="text-lg font-bold text-ivorian-black">
                  {formatPrice(product.price)}
                </div>
              )
            )}
          </div>

          <Button
            onClick={() => addToCart({ productId: product.id })}
            disabled={isAdding}
            className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isAdding ? "..." : "Ajouter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}