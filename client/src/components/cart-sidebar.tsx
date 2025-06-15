import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import B2CCheckoutModal from "./b2c-checkout-modal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartSummary, updateQuantity, removeItem, isUpdating } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleProceedToCheckout = () => {
    if (cartSummary.itemCount === 0) return;
    setShowCheckout(true);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-ivorian-black text-white p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Votre Panier</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:text-ivorian-yellow hover:bg-transparent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartSummary.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Votre panier est vide</p>
                  <p className="text-sm">Ajoutez des produits pour commencer</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cartSummary.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100&h=100&fit=crop"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.product.name}</h4>
                        <p className="text-gray-600 text-xs">
                          {formatPrice(parseFloat(item.product.price))}
                        </p>
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Badge variant="secondary" className="mx-2">
                            {item.quantity}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartSummary.items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{formatPrice(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>{formatPrice(cartSummary.deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-ivorian-black">{formatPrice(cartSummary.total)}</span>
                </div>
              </div>
              <Button
                onClick={handleProceedToCheckout}
                className="w-full bg-ivorian-yellow text-ivorian-black hover:bg-ivorian-amber font-semibold"
              >
                Procéder au Paiement
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full mt-2"
              >
                Continuer les Achats
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <B2CCheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartSummary={cartSummary}
      />
    </>
  );
}
