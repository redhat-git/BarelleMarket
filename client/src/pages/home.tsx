import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Category {
  id: number;
  name: string;
  slug: string;
}

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

export default function Home() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Banner */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-amber-400 text-black font-semibold mb-4">
            Bienvenue sur Barelle Distribution
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Produits authentiques 100% ivoiriens
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explorez le meilleur de l’artisanat, du goût et du savoir-faire de notre terroir.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Découvrir les produits
            </Button>
          </Link>
        </div>
      </section>

      {/* Produits vedettes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Produits Vedettes</h2>
            <p className="text-gray-600">Nos meilleures sélections pour vous</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products">
              <Button className="bg-amber-400 text-black hover:bg-amber-500 px-6 py-3">
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nos Catégories</h2>
            <p className="text-gray-600">Une sélection variée de produits locaux</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="p-6 text-center hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
