import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Eye, Filter, Calendar } from "lucide-react";
import type { Order } from "@shared/schema";

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/admin/orders', page, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (statusFilter) params.append('status', statusFilter);
      return apiRequest(`/api/admin/orders?${params}`);
    },
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['/api/admin/orders', selectedOrder?.id],
    queryFn: () => apiRequest(`/api/admin/orders/${selectedOrder?.id}`),
    enabled: !!selectedOrder?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, orderStatus, trackingNumber }: { 
      orderId: number; 
      orderStatus: string; 
      trackingNumber?: string; 
    }) => {
      return await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus, trackingNumber }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Total: {ordersData?.total || 0} commandes
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="shipped">Expédiées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Liste des Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Commande
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.orders?.map((order: Order) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          #{order.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.orderType === 'b2b' ? 'B2B' : 'B2C'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(order.total).toLocaleString()} CFA
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Livraison: {parseFloat(order.deliveryFee).toLocaleString()} CFA
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Select
                          value={order.orderStatus}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ 
                              orderId: order.id, 
                              orderStatus: status 
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} sur {Math.ceil((ordersData?.total || 0) / 20)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil((ordersData?.total || 0) / 20)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la Commande #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {orderDetail && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Nom:</span> {orderDetail.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {orderDetail.email}
                      </div>
                      <div>
                        <span className="font-medium">Téléphone:</span> {orderDetail.phone}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {orderDetail.orderType === 'b2b' ? 'B2B' : 'B2C'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Adresse de Livraison</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>{orderDetail.deliveryAddress}</div>
                      <div>{orderDetail.city}</div>
                      <div>
                        <span className="font-medium">Instructions:</span> {orderDetail.deliveryInstructions || 'Aucune'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Articles Commandés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderDetail.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {item.product.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-gray-500">
                                {parseFloat(item.price).toLocaleString()} CFA × {item.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="font-medium">
                            {(parseFloat(item.price) * item.quantity).toLocaleString()} CFA
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{parseFloat(orderDetail.subtotal).toLocaleString()} CFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Livraison:</span>
                        <span>{parseFloat(orderDetail.deliveryFee).toLocaleString()} CFA</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{parseFloat(orderDetail.total).toLocaleString()} CFA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut de la Commande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusBadgeColor(orderDetail.orderStatus)}>
                        {getStatusText(orderDetail.orderStatus)}
                      </Badge>
                      {orderDetail.trackingNumber && (
                        <div>
                          <span className="font-medium">Numéro de suivi:</span> {orderDetail.trackingNumber}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}