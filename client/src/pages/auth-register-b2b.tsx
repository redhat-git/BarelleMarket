import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building, Mail, Phone, MapPin, Lock, Eye, EyeOff } from "lucide-react";

const b2bRegistrationSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  companyType: z.string().min(1, "Le type d'entreprise est requis"),
  rccm: z.string().min(1, "Le numéro RCCM est requis"),
  siret: z.string().optional(),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  phone: z.string().min(10, "Le numéro de téléphone est requis"),
  secondContactName: z.string().min(2, "Le nom du second contact est requis"),
  secondContactPhone: z.string().min(10, "Le téléphone du second contact est requis"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type B2BRegistrationData = z.infer<typeof b2bRegistrationSchema>;

export default function AuthRegisterB2B() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<B2BRegistrationData>({
    resolver: zodResolver(b2bRegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      companyName: "",
      companyType: "",
      rccm: "",
      siret: "",
      address: "",
      city: "",
      phone: "",
      secondContactName: "",
      secondContactPhone: "",
    },
  });

  const onSubmit = async (data: B2BRegistrationData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register-b2b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Inscription réussie !",
          description: "Votre compte B2B a été créé. Vous pouvez maintenant vous connecter.",
        });
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        const error = await response.json();
        toast({
          title: "Erreur d'inscription",
          description: error.message ?? "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during B2B registration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivorian-yellow/20 via-white to-ivorian-black/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-ivorian-yellow to-amber-400 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-ivorian-black" />
            </div>
            <h1 className="text-3xl font-bold text-ivorian-black mb-2">
              Inscription B2B
            </h1>
            <p className="text-gray-600">
              Créez votre compte professionnel pour bénéficier de tarifs privilégiés
            </p>
          </div>
        </div>

        <Card className="border-2 border-ivorian-yellow/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-ivorian-black text-center">
              Informations de l&apos;entreprise
            </CardTitle>
            <CardDescription className="text-center">
              Remplissez les informations ci-dessous pour créer votre compte B2B
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Informations personnelles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="mt-1"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    className="mt-1"
                    placeholder="Au moins 6 caractères"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    className="mt-1"
                    placeholder="Confirmez votre mot de passe"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    className="mt-1"
                    placeholder="+225 XX XX XX XX"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations de l&apos;entreprise
                </h3>

                <div>
                  <Label htmlFor="companyName">Nom de l&apos;entreprise *</Label>
                  <Input
                    id="companyName"
                    {...form.register("companyName")}
                    className="mt-1"
                    placeholder="Nom officiel de votre entreprise"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyType">Type d&apos;entreprise *</Label>
                  <Select onValueChange={(value) => form.setValue("companyType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez le type d'entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="bar">Bar/Café</SelectItem>
                      <SelectItem value="hotel">Hôtel</SelectItem>
                      <SelectItem value="distributeur">Distributeur</SelectItem>
                      <SelectItem value="grossiste">Grossiste</SelectItem>
                      <SelectItem value="epicerie">Épicerie</SelectItem>
                      <SelectItem value="supermarche">Supermarché</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.companyType && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyType.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rccm">Numéro RCCM *</Label>
                  <Input
                    id="rccm"
                    {...form.register("rccm")}
                    className="mt-1"
                    placeholder="CI-ABJ-01-2024-B12-00001"
                  />
                  {form.formState.errors.rccm && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.rccm.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="siret">Numéro SIRET (optionnel)</Label>
                  <Input
                    id="siret"
                    {...form.register("siret")}
                    className="mt-1"
                    placeholder="12345678901234"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse de l&apos;entreprise
                </h3>

                <div>
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    className="mt-1"
                    placeholder="123 Rue de la Paix"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    className="mt-1"
                    placeholder="Paris"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Second Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact secondaire
                </h3>

                <div>
                  <Label htmlFor="secondContactName">Nom du second contact *</Label>
                  <Input
                    id="secondContactName"
                    {...form.register("secondContactName")}
                    className="mt-1"
                    placeholder="Prénom Nom"
                  />
                  {form.formState.errors.secondContactName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.secondContactName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="secondContactPhone">Téléphone du second contact *</Label>
                  <Input
                    id="secondContactPhone"
                    {...form.register("secondContactPhone")}
                    className="mt-1"
                    placeholder="+225 XX XX XX XX"
                  />
                  {form.formState.errors.secondContactPhone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.secondContactPhone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* MOQ Information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-400 rounded-full p-1 mt-0.5">
                    <svg className="w-4 h-4 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">
                      Commande Minimum B2B
                    </h4>
                    <p className="text-sm text-amber-700">
                      <strong>Montant minimum de commande : 200 000 XOF (FCFA)</strong>
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Ce montant minimum vous permet de bénéficier de nos tarifs préférentiels et de la livraison gratuite.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-ivorian-black to-ivorian-dark hover:from-ivorian-dark hover:to-black text-white font-medium"
              >
                {isSubmitting ? "Création en cours..." : "Créer mon compte B2B"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/auth/login" className="text-ivorian-black hover:underline font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>=
    </div>
  );
}