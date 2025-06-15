import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  CheckCircle,
  Package,
  Calendar,
  CreditCard,
  Edit,
  Save
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  companyType: z.string().min(2, "Type d'entreprise requis"),
  siret: z.string().optional(),
  address: z.string().min(10, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function B2BProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
      companyType: "",
      siret: "",
      address: "",
      city: "",
      phone: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Accès non autorisé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        companyName: user.companyName || "",
        companyType: user.companyType || "",
        siret: user.siret || "",
        address: user.address || "",
        city: user.city || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expirée",
          description: "Reconnectez-vous pour continuer.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(price)) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    const labels = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ivorian-yellow"></div>
          <p className="mt-2 text-gray-600">Chargement de votre profil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ivorian-black mb-2">
            Mon Espace Professionnel B2B
          </h1>
          <p className="text-gray-600">
            Gérez vos informations d'entreprise et suivez vos commandes
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-ivorian-black to-ivorian-dark text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Bienvenue, {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-300">
                  {user.companyName && `${user.companyName} • `}
                  Membre depuis {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-ivorian-yellow text-ivorian-black px-4 py-2 rounded-lg">
                  <p className="font-bold text-sm">Compte B2B</p>
                  <p className="text-xs">Tarifs Privilégiés</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon Profil
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Mes Commandes
            </TabsTrigger>
            <TabsTrigger value="benefits" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Avantages B2B
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informations de l'entreprise</CardTitle>
                    <CardDescription>
                      Gérez les informations de votre compte professionnel
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "" : "bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber"}
                  >
                    {isEditing ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Annuler
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-ivorian-black flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Informations Personnelles
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prénom</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Company Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-ivorian-black flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Informations de l'Entreprise
                        </h4>

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'entreprise</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type d'entreprise</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Restaurant, Bar, Hôtel, Commerce..." disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="siret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SIRET (optionnel)</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Textarea {...field} disabled={!isEditing} rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Historique des commandes</CardTitle>
                <CardDescription>
                  Suivez vos commandes et téléchargez vos factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-ivorian-yellow"></div>
                    <p className="mt-2 text-gray-600">Chargement des commandes...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucune commande trouvée</p>
                    <Button className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber">
                      Commencer vos achats
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">Commande #{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getOrderStatusColor(order.orderStatus)}>
                              {getOrderStatusLabel(order.orderStatus)}
                            </Badge>
                            <p className="font-bold text-lg text-ivorian-black mt-1">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Livraison</p>
                            <p className="text-gray-600">{order.deliveryCity}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              Paiement
                            </p>
                            <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Voir détails
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-ivorian-black">Vos Avantages B2B</CardTitle>
                  <CardDescription>
                    Profitez de conditions privilégiées réservées aux professionnels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Tarifs préférentiels sur tous les produits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Livraison gratuite pour les commandes +100,000 FCFA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Service client dédié et personnalisé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Catalogue exclusif pour professionnels</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Conditions de paiement adaptées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-ivorian-yellow" />
                    <span>Support pour événements et grandes commandes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-ivorian-black">Besoin d'aide ?</CardTitle>
                  <CardDescription>
                    Notre équipe B2B est là pour vous accompagner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-ivorian-yellow" />
                      <div>
                        <p className="font-medium">Téléphone B2B</p>
                        <p className="text-sm text-gray-600">+225 XX XX XX XX</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-ivorian-yellow" />
                      <div>
                        <p className="font-medium">Email B2B</p>
                        <p className="text-sm text-gray-600">b2b@barelle-distribution.ci</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-ivorian-yellow mt-1" />
                      <div>
                        <p className="font-medium">Showroom professionnel</p>
                        <p className="text-sm text-gray-600">
                          Zone Industrielle de Yopougon<br />
                          Abidjan, Côte d'Ivoire
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <Button className="bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber">
                      Programmer un rendez-vous
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
