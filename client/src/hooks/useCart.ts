import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartItemWithProduct, CartSummary } from "@/lib/types";
import { isUnauthorizedError } from "@/lib/authUtils";

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      console.log('Adding to cart:', { productId, quantity });

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Add to cart response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre panier avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit au panier.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre panier",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Calculate cart summary
  const cartSummary: CartSummary = {
    items: cartItems,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0),
    deliveryFee: cartItems.length > 0 ? 2500 : 0,
    total: 0,
  };
  cartSummary.total = cartSummary.subtotal + cartSummary.deliveryFee;

  return {
    cartItems,
    cartSummary,
    isLoading,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAdding: addToCart.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeItemMutation.isPending,
  };
}