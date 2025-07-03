import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Constante pour le montant minimum de commande B2B (en CFA)
export const B2B_MINIMUM_ORDER = 200_000;

// Typage explicite pour l'utilisateur
interface User {
  isB2B?: boolean;
}

// Props du composant
interface B2BMinimumValidatorProps {
  children: React.ReactNode;
}

export default function B2BMinimumValidator({ children }: B2BMinimumValidatorProps) {
  const { cartSummary } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Vérification si l'utilisateur est B2B
  const isB2BUser = isAuthenticated && user?.isB2B === true;

  // Vérification si le total du panier est sous le minimum
  const isUnderMinimum =
    isB2BUser &&
    cartSummary.total != null &&
    cartSummary.itemCount > 0 &&
    cartSummary.total < B2B_MINIMUM_ORDER;

  // Formatage des nombres avec la devise CFA
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });

  // Notification toast pour les utilisateurs B2B sous le minimum
  useEffect(() => {
    if (isUnderMinimum) {
      const remaining = B2B_MINIMUM_ORDER - cartSummary.total;
      toast({
        title: "Commande minimum B2B",
        description: `Ajoutez encore ${formatCurrency(remaining)} pour atteindre le minimum de ${formatCurrency(B2B_MINIMUM_ORDER)} requis.`,
        variant: "destructive",
      });
    }
  }, [cartSummary.total, cartSummary.itemCount, isB2BUser, toast]);

  // Si l'utilisateur n'est pas B2B, rendre les enfants directement
  if (!isB2BUser) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {isUnderMinimum && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" aria-label="Icône d'avertissement" />
          <AlertDescription>
            <strong>Commande minimum B2B :</strong> Il vous manque{" "}
            <strong>{formatCurrency(B2B_MINIMUM_ORDER - cartSummary.total)}</strong>{" "}
            pour atteindre le minimum de{" "}
            <strong>{formatCurrency(B2B_MINIMUM_ORDER)}</strong> requis pour les
            commandes professionnelles.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
}