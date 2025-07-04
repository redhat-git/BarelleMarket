import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createCategorySchema } from "@shared/schema";
import { Package, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type Category = {
    id: number;
    name: string;
    slug: string;
    description?: string;
};

export default function AdminCategories() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Chargement des catégories
    const {
        data: categories,
        isLoading,
        error,
    } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            // FIX: Remplacer apiRequest par fetch direct
            const res = await fetch("/api/categories", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur chargement catégories");
            return res.json();
        },
    });

    // Mutation création
    const createCategoryMutation = useMutation({
        mutationFn: async (data: Omit<Category, "id">) => {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Erreur création catégorie");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });

            setIsDialogOpen(false);
            setEditingCategory(null);
            form.reset();
            toast({ title: "Catégorie créée avec succès" });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de créer la catégorie",
                variant: "destructive",
            });
        },
    });

    // Mutation mise à jour
    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Omit<Category, "id"> }) => {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Erreur mise à jour catégorie");
            return res.json();
        },
        onSuccess: () => {
            // FIX 3: Même correction pour la mise à jour
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsDialogOpen(false);
            setEditingCategory(null);
            form.reset();
            toast({ title: "Catégorie mise à jour avec succès" });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de mettre à jour la catégorie",
                variant: "destructive",
            });
        },
    });

    // Mutation suppression
    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur suppression catégorie");
            return res.json();
        },
        onSuccess: () => {
            // FIX 4: Même correction pour la suppression
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast({ title: "Catégorie supprimée avec succès" });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de supprimer la catégorie",
                variant: "destructive",
            });
        },
    });

    // Formulaire react-hook-form avec validation zod
    const form = useForm<Omit<Category, "id">>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    });

    const onSubmit = (data: Omit<Category, "id">) => {
        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory.id, data });
        } else {
            createCategoryMutation.mutate(data);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        form.reset({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
        });
        setIsDialogOpen(true);
    };

    const generateSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    // FIX 5: Gestion des erreurs
    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur de chargement : {error.message}</div>;

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* Bouton retour au dashboard */}
            <div className="mb-6">
                <Link href="/admin">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au tableau de bord
                    </Button>
                </Link>
            </div>

            {/* DEBUG: Afficher le nombre de catégories */}
            <div className="mb-4 text-sm text-gray-500">
                {categories ? `${categories.length} catégorie(s) trouvée(s)` : "Aucune catégorie"}
            </div>

            {/* Titre et bouton ajouter */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                    <Package className="h-8 w-8" />
                    Gestion des catégories
                </h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter une catégorie
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                                noValidate
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        if (!editingCategory) {
                                                            form.setValue("slug", generateSlug(e.target.value));
                                                        }
                                                    }}
                                                    autoFocus
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
                                            <FormLabel>Slug (URL)</FormLabel>
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={3} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                >
                                    {createCategoryMutation.isPending || updateCategoryMutation.isPending
                                        ? "Enregistrement..."
                                        : editingCategory
                                            ? "Mettre à jour"
                                            : "Créer"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Liste des catégories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        Aucune catégorie trouvée
                    </div>
                ) : (
                    categories?.map((category) => (
                        <Card key={category.id}>
                            <CardContent>
                                <h2 className="font-semibold text-lg">{category.name}</h2>
                                <p className="text-xs text-gray-400 mb-2">Slug: {category.slug}</p>
                                {category.description && (
                                    <p className="text-gray-600 text-sm">{category.description}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Edit className="inline h-4 w-4 mr-1" />
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (window.confirm("Supprimer cette catégorie ?")) {
                                                deleteCategoryMutation.mutate(category.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="inline h-4 w-4" />
                                        Supprimer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}