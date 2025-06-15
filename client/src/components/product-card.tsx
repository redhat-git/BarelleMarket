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
}

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
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
