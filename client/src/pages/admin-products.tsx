import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

// Zod schema for form validation
const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  b2bPrice: z.coerce.number().optional(),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.coerce.number().positive("Veuillez sélectionner une catégorie"),
  stockQuantity: z.coerce.number().min(0, "Le stock ne peut pas être négatif").optional(),
  isFeatured: z.boolean().optional(),
  image: z.instanceof(File).optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize react-hook-form
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: 0,
      b2bPrice: 0,
      originalPrice: 0,
      categoryId: 0,
      stockQuantity: 0,
      isFeatured: false,
      image: null,
    },
  });

  // Watch name field for auto-generating slug
  const name = watch("name");

  // Fetch products from API
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des produits");
      return res.json();
    },
  });

  // Fetch categories from API
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
      return res.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log("Données à envoyer:", data);

      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("slug", (data.slug || "").trim());
      formData.append("description", (data.description || "").trim());
      formData.append("shortDescription", (data.shortDescription || "").trim());

      // Convert numbers to strings for FormData
      formData.append("price", data.price.toString());
      formData.append("categoryId", data.categoryId.toString());
      formData.append("stockQuantity", (data.stockQuantity || 0).toString());
      formData.append("isFeatured", data.isFeatured ? "true" : "false");

      // Only add optional price fields if they have valid values
      if (data.b2bPrice && data.b2bPrice > 0) {
        formData.append("b2bPrice", data.b2bPrice.toString());
      }
      if (data.originalPrice && data.originalPrice > 0) {
        formData.append("originalPrice", data.originalPrice.toString());
      }

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      // Log FormData for debugging
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: `, value);
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch (e) {
          errorData = `Erreur de parsing: ${e.message}`;
        }

        console.error("Erreur serveur complète:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: errorData
        });

        throw new Error(`Échec de la création du produit (${response.status}): ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      setImagePreview(null);
      reset();
      toast({ title: "Produit créé avec succès" });
    },
    onError: (error) => {
      console.error("Erreur création produit:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le produit",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      console.log("Données de mise à jour:", { id, data });

      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("slug", (data.slug || "").trim());
      formData.append("description", (data.description || "").trim());
      formData.append("shortDescription", (data.shortDescription || "").trim());

      // Convert numbers to strings for FormData
      formData.append("price", data.price.toString());
      formData.append("categoryId", data.categoryId.toString());
      formData.append("stockQuantity", (data.stockQuantity || 0).toString());
      formData.append("isFeatured", data.isFeatured ? "true" : "false");

      // Only add optional price fields if they have valid values
      if (data.b2bPrice && data.b2bPrice > 0) {
        formData.append("b2bPrice", data.b2bPrice.toString());
      }
      if (data.originalPrice && data.originalPrice > 0) {
        formData.append("originalPrice", data.originalPrice.toString());
      }

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      // Log FormData for debugging
      console.log("FormData entries pour update:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: `, value);
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch (e) {
          errorData = `Erreur de parsing: ${e.message}`;
        }

        console.error("Erreur serveur complète:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: errorData
        });

        throw new Error(`Échec de la mise à jour du produit (${response.status}): ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      setImagePreview(null);
      reset();
      toast({ title: "Produit mis à jour avec succès" });
    },
    onError: (error) => {
      console.error("Erreur mise à jour produit:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Échec de la suppression du produit: ${errorData} `);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produit supprimé avec succès" });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProductFormData) => {
    const processedData = {
      ...data,
      slug: data.slug || generateSlug(data.name),
      description: data.description?.trim() || "",
      shortDescription: data.shortDescription?.trim() || "",
      stockQuantity: data.stockQuantity || 0,
      isFeatured: data.isFeatured || false,
      image: data.image || null,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: processedData });
    } else {
      createProductMutation.mutate(processedData);
    }
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl || null);
    setValue("name", product.name || "");
    setValue("slug", product.slug || "");
    setValue("description", product.description || "");
    setValue("shortDescription", product.shortDescription || "");
    setValue("price", product.price || 0);
    setValue("b2bPrice", product.b2bPrice || 0);
    setValue("originalPrice", product.originalPrice || 0);
    setValue("categoryId", product.categoryId || 0);
    setValue("stockQuantity", product.stockQuantity || 0);
    setValue("isFeatured", product.isFeatured || false);
    setValue("image", null);
    setIsCreateDialogOpen(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }
      setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Auto-generate slug when name changes
  React.useEffect(() => {
    if (!editingProduct && name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, editingProduct, setValue]);

  // Reset form
  const resetForm = () => {
    reset();
    setEditingProduct(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au tableau de bord
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Gérer les Catégories
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8" />
              Gestion des Produits
            </h1>
            <p className="text-gray-600 mt-2">Gérez votre catalogue de produits</p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Produit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Modifiez les informations du produit ci-dessous."
                    : "Remplissez les informations pour créer un nouveau produit."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du Produit *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Nom du produit"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder="slug-du-produit"
                    />
                    {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Description Courte</Label>
                  <Input
                    id="shortDescription"
                    {...register("shortDescription")}
                    placeholder="Description courte du produit"
                  />
                  {errors.shortDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description Complète</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    placeholder="Description détaillée du produit"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Prix B2C (CFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price")}
                      placeholder="0"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="b2bPrice">Prix B2B (CFA)</Label>
                    <Input
                      id="b2bPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("b2bPrice")}
                      placeholder="0"
                    />
                    {errors.b2bPrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.b2bPrice.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Prix Original (CFA)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("originalPrice")}
                      placeholder="0"
                    />
                    {errors.originalPrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.originalPrice.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryId">Catégorie *</Label>
                    <Select
                      onValueChange={(value) => setValue("categoryId", Number(value))}
                      value={watch("categoryId")?.toString()}
                      disabled={categoriesLoading || !categories || categories.length === 0}
                    >
                      <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? "Chargement..."
                              : !categories || categories.length === 0
                                ? "Aucune catégorie disponible"
                                : "Sélectionnez une catégorie"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stockQuantity">Stock</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      {...register("stockQuantity")}
                      placeholder="0"
                    />
                    {errors.stockQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Image du Produit</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Aperçu de l'image"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Produit Vedette</Label>
                    <div className="text-sm text-muted-foreground">
                      Afficher ce produit dans la section des produits vedettes
                    </div>
                  </div>
                  <Switch
                    checked={watch("isFeatured")}
                    onCheckedChange={(checked) => setValue("isFeatured", checked)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? "Enregistrement..."
                    : editingProduct
                      ? "Mettre à Jour"
                      : "Créer le Produit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={product.imageUrl || "/api/placeholder/300/300"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {product.isFeatured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Vedette
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">B2C</Badge>
                      <span className="font-bold text-green-600">
                        {parseFloat(product.price).toLocaleString()} CFA
                      </span>
                    </div>
                    {product.b2bPrice && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">B2B</Badge>
                        <span className="font-bold text-blue-600">
                          {parseFloat(product.b2bPrice).toLocaleString()} CFA
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Stock: {product.stockQuantity}</span>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}