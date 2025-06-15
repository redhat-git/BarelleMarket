import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export default function Landing() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products/featured"],
  });

  const getCategoryImage = (slug: string) => {
    const images = {
      'spiritueux': 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=300&fit=crop',
      'jus-naturels': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop',
      'cigares': 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop',
      'accessoires': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    };
    return images[slug] || images.spiritueux;
  };

  const getCategoryColor = (slug: string) => {
    const colors = {
      'spiritueux': 'from-ivorian-yellow to-ivorian-amber',
      'jus-naturels': 'from-green-400 to-green-600',
      'cigares': 'from-amber-700 to-amber-900',
      'accessoires': 'from-gray-700 to-gray-900',
    };
    return colors[slug] || colors.spiritueux;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-ivorian-black to-ivorian-dark text-white">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                Découvrez l'Excellence 
                <span className="text-ivorian-yellow"> Ivoirienne</span>
              </h2>
              <p className="text-xl mb-8 text-gray-300">
                Spiritueux d'exception, jus naturels authentiques et cigares premium. 
                Une sélection exclusive de produits 100% ivoiriens pour les connaisseurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber font-semibold px-8 py-4 text-lg">
                    Découvrir nos Produits
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-ivorian-yellow text-ivorian-yellow hover:bg-ivorian-yellow hover:text-ivorian-black font-semibold px-8 py-4 text-lg"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Espace Professionnel B2B
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&h=600&fit=crop"
                alt="Bouteille de spiritueux ivoirien premium"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -right-4 bg-ivorian-yellow text-ivorian-black p-4 rounded-lg shadow-lg">
                <p className="font-bold text-sm">100% Authentique</p>
                <p className="text-xs">Côte d'Ivoire</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-ivorian-black mb-4">Nos Catégories</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez notre sélection exclusive de produits ivoiriens authentiques, 
              soigneusement choisis pour leur qualité exceptionnelle.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getCategoryColor(category.slug)} p-8 text-center text-white transform group-hover:scale-105 transition-transform duration-300`}>
                    <img
                      src={getCategoryImage(category.slug)}
                      alt={category.name}
                      className="w-20 h-20 mx-auto mb-4 rounded-lg object-cover"
                    />
                    <h4 className="text-xl font-bold mb-2">{category.name}</h4>
                    <p className="text-sm opacity-90 mb-4">
                      {category.description || "Découvrez notre sélection"}
                    </p>
                    <Badge className="bg-white text-gray-800">
                      Voir les produits
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-ivorian-black mb-4">Produits en Vedette</h3>
            <p className="text-gray-600">Découvrez notre sélection exclusive de produits phares</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/products">
              <Button className="bg-ivorian-black text-white hover:bg-ivorian-dark px-8 py-3">
                Voir Tous les Produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-16 bg-ivorian-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Espace Professionnel B2B</h3>
              <p className="text-gray-300 mb-8">
                Rejoignez notre réseau de partenaires professionnels et bénéficiez de conditions privilégiées, 
                tarifs dégressifs et service dédié pour votre entreprise.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="text-ivorian-yellow mr-3 h-5 w-5" />
                  <span>Tarifs préférentiels pour les professionnels</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-ivorian-yellow mr-3 h-5 w-5" />
                  <span>Livraisons rapides et en gros volumes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-ivorian-yellow mr-3 h-5 w-5" />
                  <span>Service client dédié et personnalisé</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-ivorian-yellow mr-3 h-5 w-5" />
                  <span>Catalogue exclusif pour professionnels</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber font-semibold"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Créer un Compte Pro
                </Button>
                <Button
                  variant="outline"
                  className="border-ivorian-yellow text-ivorian-yellow hover:bg-ivorian-yellow hover:text-ivorian-black font-semibold"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Se Connecter
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop"
                alt="Professionnel travaillant dans un bureau moderne"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -left-4 bg-ivorian-yellow text-ivorian-black p-4 rounded-lg shadow-lg">
                <p className="font-bold text-sm">+ de 500</p>
                <p className="text-xs">Entreprises Partenaires</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
