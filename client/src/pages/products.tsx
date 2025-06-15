import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Get category from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { 
      categoryId: selectedCategory ? categories.find(c => c.slug === selectedCategory)?.id : undefined,
      search: searchTerm || undefined,
      featured: location.includes('featured=true') || undefined
    }],
    enabled: true,
  });

  const selectedCategoryData = categories.find(c => c.slug === selectedCategory);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    window.history.pushState({}, '', '/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ivorian-black mb-4">
            {selectedCategoryData ? selectedCategoryData.name : "Tous nos Produits"}
          </h1>
          <p className="text-gray-600">
            {selectedCategoryData 
              ? selectedCategoryData.description 
              : "Découvrez notre catalogue complet de produits 100% ivoiriens"
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nom du produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div>
              {(searchTerm || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: "{searchTerm}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCategoryData?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSelectedCategory("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ivorian-yellow"></div>
            <p className="mt-2 text-gray-600">Chargement des produits...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Aucun produit trouvé
              {searchTerm && ` pour "${searchTerm}"`}
              {selectedCategory && ` dans la catégorie "${selectedCategoryData?.name}"`}
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Voir tous les produits
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  categoryName={categories.find(c => c.id === product.categoryId)?.name}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
