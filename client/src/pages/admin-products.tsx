import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Star } from "lucide-react";
import type { Product, Category, CreateProduct } from "@shared/schema";
import { z } from "zod";

type CreateProductFormData = z.infer<typeof createProductSchema>;

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products', page],
    queryFn: () => apiRequest(`/api/products?page=${page}&limit=20`),
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductFormData) => {
      return await apiRequest('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Produit créé",
        description: "Le produit a été créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: number; productData: Partial<CreateProductFormData> }) => {
      return await apiRequest(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: "",
      imageUrl: "",
      categoryId: 0,
      stockQuantity: 0,
      isFeatured: false,
    },
  });

  const onSubmit = (data: CreateProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData: data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity || 0,
      isFeatured: product.isFeatured || false,
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header professionnel */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestion des Produits</h1>
                <p className="text-yellow-100 mt-1">
                  Gérez votre catalogue de produits Barelle Distribution
                </p>
              </div>
            </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Produit
                </Button>
              </DialogTrigger>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Modifier le Produit" : "Créer un Nouveau Produit"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du Produit</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue('slug', generateSlug(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description Courte</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description Complète</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (CFA)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: Category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'Image</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Produit en Vedette</FormLabel>
                          <div className="text-sm text-gray-500">
                            Afficher ce produit sur la page d'accueil
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {editingProduct ? "Mettre à jour" : "Créer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-yellow-200 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              Catalogue de Produits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData?.map((product: Product) => {
                const category = categories?.find((c: Category) => c.id === product.categoryId);
                return (
                  <Card key={product.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-300 bg-white relative overflow-hidden group">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {product.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {product.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {category?.name || 'Sans catégorie'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Stock: {product.stockQuantity || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-yellow-600">
                            {parseFloat(product.price).toLocaleString()} CFA
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(!productsData || productsData.length === 0) && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Commencez par créer votre premier produit.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}