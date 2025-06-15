
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AuthLogin() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  const handleReplitLogin = () => {
    window.location.href = "/api/auth/replit";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivorian-yellow/20 via-white to-ivorian-black/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-ivorian-yellow to-amber-400 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-ivorian-black">B</span>
          </div>
          <h1 className="text-3xl font-bold text-ivorian-black mb-2">
            Bienvenue sur Barelle
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <Card className="border-2 border-ivorian-yellow/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ivorian-black">
              Connexion
            </CardTitle>
            <CardDescription>
              Choisissez votre méthode de connexion préférée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                Continuer avec Google
              </span>
            </Button>

            {/* Facebook Login */}
            <Button
              onClick={handleFacebookLogin}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700 font-medium">
                Continuer avec Facebook
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            {/* Replit Login */}
            <Button
              onClick={handleReplitLogin}
              className="w-full h-12 bg-gradient-to-r from-ivorian-black to-ivorian-dark hover:from-ivorian-dark hover:to-black text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5" />
              <span>Continuer avec Replit</span>
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                En vous connectant, vous acceptez nos{" "}
                <a href="#" className="text-ivorian-black hover:underline font-medium">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="#" className="text-ivorian-black hover:underline font-medium">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inscription B2B */}
        <Card className="mt-6 border border-gray-200">
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
                className="w-full border-ivorian-yellow text-ivorian-black hover:bg-ivorian-yellow/10"
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
