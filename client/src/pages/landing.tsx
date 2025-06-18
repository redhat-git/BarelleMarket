import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, Globe, Award, Users, ShoppingBag, Shield } from "lucide-react";

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

export default function Landing() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const getCategoryImage = (slug: string) => {
    const images: { [key: string]: string } = {
      'spiritueux': 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=300&fit=crop',
      'jus-naturels': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop',
      'cigares': 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop',
    };
    return images[slug] || images.spiritueux;
  };

  const getCategoryColor = (slug: string) => {
    const colors: { [key: string]: string } = {
      'spiritueux': 'from-amber-400 to-amber-600',
      'jus-naturels': 'from-green-400 to-green-600',
      'cigares': 'from-amber-700 to-amber-900',
      'accessoires': 'from-gray-700 to-gray-900',
    };
    return colors[slug] || colors.spiritueux;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-amber-400/20 to-transparent"></div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-400 text-black font-semibold px-4 py-2">
                  100% Produits Ivoiriens Authentiques
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white">Barelle</span>
                  <br />
                  <span className="text-amber-400">Distribution</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                  Chez BARELLE  Distribution, nous croyons que la richesse d&apos;un Pays se révèle
                  dans ce qu&apos;il produit de plus authentique.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-4 text-lg">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Découvrir nos produits
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold px-6 py-4">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-6 py-4">
                      S&apos;inscrire
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">200+</div>
                  <div className="text-sm text-gray-400">Produits authentiques</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">4+</div>
                  <div className="text-sm text-gray-400">Catégories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">100%</div>
                  <div className="text-sm text-gray-400">Made in Côte d&apos;Ivoire</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="icons/navimage.jpg"
                  alt="Produits ivoiriens premium"
                  className="rounded-2xl shadow-2xl border-4 border-amber-400/30"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-amber-400/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Barelle Distribution ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous sommes votre partenaire de confiance pour découvrir et distribuer
              les meilleurs produits de Côte d&apos;Ivoire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 hover:border-amber-400">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Qualité Premium</h3>
                <p className="text-gray-600">
                  Sélection rigoureuse des meilleurs producteurs ivoiriens
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 hover:border-amber-400">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Livraison Internationale</h3>
                <p className="text-gray-600">
                  Expédition sécurisée vers l&apos;Afrique, l&apos;Europe et l&apos;Amérique
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 hover:border-amber-400">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Authenticité Garantie</h3>
                <p className="text-gray-600">
                  Certificats d&apos;origine et traçabilité complète de nos produits
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 hover:border-amber-400">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Support B2B</h3>
                <p className="text-gray-600">
                  Solutions personnalisées pour professionnels et revendeurs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Catégories Premium
            </h2>
            <p className="text-xl text-gray-600">
              Explorez notre sélection de produits ivoiriens d&apos;exception
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-amber-400">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getCategoryImage(category.slug)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryColor(category.slug)} opacity-80`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white text-center px-4">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produits Vedettes
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez nos produits les plus appréciés par nos clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4">
                Voir tous nos produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* B2B Registration Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Devenez Partenaire B2B
              </h2>
              <p className="text-xl text-gray-300">
                Accédez à des prix préférentiels et bénéficiez d&apos;un service dédié
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Prix préférentiels</h3>
                    <p className="text-gray-300">Bénéficiez de remises importantes sur tous nos produits</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Service dédié</h3>
                    <p className="text-gray-300">Un conseiller commercial attitré pour vos besoins</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Livraison prioritaire</h3>
                    <p className="text-gray-300">Délais de livraison réduits et suivi personnalisé</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Catalogue exclusif</h3>
                    <p className="text-gray-300">Accès à des produits réservés aux partenaires</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center">Inscription Gratuite</h3>
                <div className="space-y-6">
                  <p className="text-gray-300 text-center">
                    Connectez-vous avec votre compte Replit pour commencer
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-4"
                    onClick={() => window.location.href = '/auth/login'}
                  >
                    Se connecter / S&apos;inscrire
                  </Button>
                  <p className="text-sm text-gray-400 text-center">
                    Accès gratuit avec votre compte Replit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black to-amber-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Prêt à découvrir l&apos;authenticité ivoirienne ?
            </h2>
            <p className="text-xl text-gray-300">
              Rejoignez des milliers de clients satisfaits qui font confiance à Barelle Distribution
              pour leurs produits ivoiriens premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-4">
                  Commander maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}