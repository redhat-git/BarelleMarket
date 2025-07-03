import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { addToCart, isAdding } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${params?.slug}`],
    enabled: !!params?.slug,
  });

  interface Category {
    id: number;
    name: string;
    slug: string;
  }

  interface Product {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    price: string;
    originalPrice?: string;
    imageUrl: string;
    additionalImages?: string[];
    rating: string;
    reviewCount: number;
    stockQuantity: number;
    specifications?: Record<string, string>;
  }

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ivorian-yellow"></div>
          <p className="mt-2 text-gray-600">Chargement du produit...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <Link href="/products">
            <Button>Retour aux produits</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  const images = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
  const currentImage = images[selectedImageIndex] || "images";

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(price)) + ' FCFA';
  };

  const getCategoryColor = (categoryId: number) => {
    switch (categoryId) {
      case 1: return "bg-ivorian-yellow text-ivorian-black";
      case 2: return "bg-green-500 text-white";
      case 3: return "bg-amber-700 text-white";
      case 4: return "bg-gray-700 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="h-4 w-4 text-yellow-400"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity });
  };

  const handleAddToWishlist = () => {
    toast({
      title: "Ajouté aux favoris",
      description: "Le produit a été ajouté à votre liste de souhaits",
    });
  };

  const handleRating = async (rating: number) => {
    setUserRating(rating);
    setIsSubmittingRating(true);

    try {
      const res = await fetch(`/api/products/${product.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (!res.ok) {
        throw new Error("Erreur d'envoi");
      }

      toast({
        title: "Merci !",
        description: "Votre note a été enregistrée.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la note.",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-ivorian-amber">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-ivorian-amber">Produits</Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${category.slug}`} className="hover:text-ivorian-amber">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <Link href="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="relative overflow-hidden rounded-lg shadow-lg mb-4">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <button
                      key={`${product.id}-${image}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${selectedImageIndex === index ? 'border-ivorian-yellow' : 'border-gray-200 hover:border-ivorian-yellow'}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <Badge className={`text-xs font-semibold mb-3 ${getCategoryColor(product.categoryId)}`}>
                  {category?.name ?? 'Produit'}
                </Badge>

                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      disabled={isSubmittingRating}
                    >
                      <Star
                        className={`h-5 w-5 ${userRating && star <= userRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          } hover:text-yellow-400`}
                      />
                    </button>
                  ))}
                  {userRating && (
                    <span className="ml-2 text-sm text-gray-600">Votre note : {userRating}/5</span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-ivorian-black mb-4">{product.name}</h1>

              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-ivorian-black">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        -{Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Prix TTC, hors frais de livraison</p>
              </div>

              {product.specifications && (
                <div className="mb-6">
                  <h4 className="font-bold mb-2">Caractéristiques:</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key}>• {key}: {value}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <span className="font-semibold">Quantité:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stockQuantity === 0}
                  className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber font-semibold py-3"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isAdding ? "Ajout en cours..." : "Ajouter au Panier"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="border-ivorian-black text-ivorian-black hover:bg-ivorian-black hover:text-white font-semibold py-3"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Ajouter aux Favoris
                </Button>
              </div>

              {product.stockQuantity === 0 && (
                <p className="text-red-600 font-semibold mt-4">Produit en rupture de stock</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
