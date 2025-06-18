import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const B2B_MINIMUM_ORDER = 200000; // 200,000 CFA

interface B2BMinimumValidatorProps {
  children: React.ReactNode;
}

export default function B2BMinimumValidator({ children }: B2BMinimumValidatorProps) {
  const { cartSummary } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const typedUser = user as any;

  const isB2BUser = isAuthenticated && typedUser?.isB2B;
  const isUnderMinimum = isB2BUser && cartSummary.total < B2B_MINIMUM_ORDER;

  useEffect(() => {
    if (isB2BUser && cartSummary.itemCount > 0 && cartSummary.total < B2B_MINIMUM_ORDER) {
      const remaining = B2B_MINIMUM_ORDER - cartSummary.total;
      toast({
        title: "Commande minimum B2B",
        description: `Ajoutez encore ${remaining.toLocaleString()} CFA pour atteindre le minimum de ${B2B_MINIMUM_ORDER.toLocaleString()} CFA`,
        variant: "destructive",
      });
    }
  }, [cartSummary.total, isB2BUser, cartSummary.itemCount, toast]);

  if (!isB2BUser) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {isUnderMinimum && cartSummary.itemCount > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Commande minimum B2B :</strong> Il vous manque{" "}
            <strong>{(B2B_MINIMUM_ORDER - cartSummary.total).toLocaleString()} CFA</strong>{" "}
            pour atteindre le minimum de <strong>{B2B_MINIMUM_ORDER.toLocaleString()} CFA</strong> 
            requis pour les commandes professionnelles.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
}

export { B2B_MINIMUM_ORDER };