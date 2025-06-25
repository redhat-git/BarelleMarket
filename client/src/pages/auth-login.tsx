
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
/**
 * Page de connexion pour les utilisateurs
 * Permet aux utilisateurs de se connecter à leur compte
 * Redirige vers la page d'accueil après une connexion réussie
 */
export default function AuthLogin() {
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include',
        // Permet de conserver les cookies de session
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful, redirecting...");
        // Attendre un petit délai pour que la session soit établie
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        console.error("Login failed:", data);
        setError(data.message ?? "Erreur lors de la connexion");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Bouton retour */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Barelle Distribution
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-gray-900">
              Connexion
            </CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <a href="/auth/register" className="text-amber-600 hover:underline font-medium">
                  S&apos;inscrire
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Inscription B2B */}
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Vous êtes un professionnel ?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Créez un compte B2B pour bénéficier de tarifs privilégiés
              </p>
              <Button
                variant="outline"
                className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
                onClick={() => window.location.href = "/auth/register-b2b"}
              >
                <Mail className="w-4 h-4 mr-2" />
                Inscription B2B
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
