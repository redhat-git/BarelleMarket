
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Package, Calendar, Eye, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Order } from "@shared/schema";

interface OrderDetail extends Order {
  orderItems?: Array<{
    id: number;
    productName: string;
    productPrice: string;
    quantity: number;
    subtotal: string;
  }>;
}

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/orders");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const { data: orderDetail } = useQuery({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/orders/${selectedOrder?.id}`);
      return response.json();
    },
    enabled: !!selectedOrder?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour voir vos commandes.
            </p>
            <a href="/auth/login">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Se connecter
              </Button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p>Chargement de vos commandes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-purple-100 text-purple-800";
      case "shipped": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "confirmed": return "Confirmée";
      case "preparing": return "En préparation";
      case "shipped": return "Expédiée";
      case "delivered": return "Livrée";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Commandes
          </h1>
          <p className="text-gray-600">
            Consultez l'historique de vos commandes et leur statut
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune commande
              </h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore passé de commande.
              </p>
              <a href="/products">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Découvrir nos produits
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: Order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                    <div>
                      <CardTitle className="text-lg">
                        Commande #{order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt!).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {order.customerType?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.orderStatus!)}>
                        {getStatusText(order.orderStatus!)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="text-lg font-semibold text-amber-600">
                        {parseFloat(order.total!).toLocaleString()} CFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paiement</p>
                      <p className="text-sm text-gray-600">
                        {order.paymentMethod === 'mobile' && 'Mobile Money'}
                        {order.paymentMethod === 'cash' && 'Espèces'}
                        {order.paymentMethod === 'bank' && 'Virement bancaire'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Livraison</p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryCity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ArrowLeft 
                className="w-4 h-4 mr-2 cursor-pointer" 
                onClick={() => setSelectedOrder(null)}
              />
              Détails de la commande #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {orderDetail && (
            <div className="space-y-6">
              {/* Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Statut</h4>
                  <Badge className={getStatusColor(orderDetail.orderStatus!)}>
                    {getStatusText(orderDetail.orderStatus!)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Date</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(orderDetail.createdAt!).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-semibold mb-2">Adresse de livraison</h4>
                <p className="text-sm text-gray-600">
                  {orderDetail.deliveryAddress}<br />
                  {orderDetail.deliveryCity}
                  {orderDetail.deliveryDistrict && `, ${orderDetail.deliveryDistrict}`}
                </p>
              </div>

              {/* Order Items */}
              {orderDetail.orderItems && (
                <div>
                  <h4 className="font-semibold mb-4">Articles commandés</h4>
                  <div className="space-y-3">
                    {orderDetail.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {parseFloat(item.productPrice).toLocaleString()} CFA × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {parseFloat(item.subtotal).toLocaleString()} CFA
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Sous-total</span>
                  <span>{parseFloat(orderDetail.subtotal!).toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Frais de livraison</span>
                  <span>{parseFloat(orderDetail.deliveryFee!).toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">
                    {parseFloat(orderDetail.total!).toLocaleString()} CFA
                  </span>
                </div>
              </div>

              {/* Notes */}
              {orderDetail.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {orderDetail.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
