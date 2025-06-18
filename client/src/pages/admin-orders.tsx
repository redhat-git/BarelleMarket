import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Order, type OrderItem, type Product, updateOrderStatusSchema, type UpdateOrderStatus } from "@shared/schema";
import { ShoppingCart, Eye, Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface OrderWithItems extends Order {
  orderItems: (OrderItem & { product: Product })[];
}

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{ orders: Order[]; total: number }>({
    queryKey: ['/api/admin/orders', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  const { data: orderDetails } = useQuery<OrderWithItems>({
    queryKey: ['/api/admin/orders', selectedOrder?.id],
    enabled: !!selectedOrder?.id,
    queryFn: async () => {
      if (!selectedOrder?.id) throw new Error('No order selected');
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      return response.json();
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: UpdateOrderStatus }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(status),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({ title: "Commande mise à jour avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de mettre à jour la commande",
        variant: "destructive"
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En Attente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmée</Badge>;
      case 'preparing':
        return <Badge className="bg-orange-100 text-orange-800"><Package className="w-3 h-3 mr-1" />Préparation</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800"><Truck className="w-3 h-3 mr-1" />Expédiée</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Livrée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Annulée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En Attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échouée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Gestion des Commandes
            </h1>
            <p className="text-gray-600 mt-2">Suivez et gérez toutes les commandes</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En Attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="preparing">Préparation</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">N° Commande</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">Client</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4 hidden lg:table-cell">Paiement</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {parseFloat(order.total).toLocaleString()} CFA
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Badge className={order.customerType === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {order.customerType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(order.orderStatus || 'pending')}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{getPaymentStatusBadge(order.paymentStatus || 'pending')}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedOrder(order as OrderWithItems)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Détails de la Commande {order.orderNumber}</DialogTitle>
                              </DialogHeader>
                              {orderDetails && (
                                <div className="space-y-6">
                                  {/* Info Client */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Informations Client</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <p><strong>Nom:</strong> {orderDetails.customerName || ''}</p>
                                        <p><strong>Email:</strong> {orderDetails.customerEmail || ''}</p>
                                        <p><strong>Téléphone:</strong> {orderDetails.customerPhone || ''}</p>
                                        <p><strong>Type:</strong> {orderDetails.customerType}</p>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Livraison</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <p><strong>Adresse:</strong> {orderDetails.deliveryAddress}</p>
                                        <p><strong>Ville:</strong> {orderDetails.deliveryCity}</p>
                                        {orderDetails.deliveryDistrict && (
                                          <p><strong>District:</strong> {orderDetails.deliveryDistrict}</p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Produits */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Produits Commandés</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3">
                                        {orderDetails.orderItems?.map((item) => (
                                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                              <p className="font-medium">{item.productName || ''}</p>
                                              <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">{parseFloat(item.subtotal || '0').toLocaleString()} CFA</p>
                                              <p className="text-sm text-gray-600">{parseFloat(item.productPrice).toLocaleString()} CFA/unité</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-4 pt-4 border-t space-y-2">
                                        <div className="flex justify-between">
                                          <span>Sous-total:</span>
                                          <span>{parseFloat(orderDetails.subtotal).toLocaleString()} CFA</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Frais de livraison:</span>
                                          <span>{parseFloat(orderDetails.deliveryFee || '0').toLocaleString()} CFA</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                          <span>Total:</span>
                                          <span>{parseFloat(orderDetails.total).toLocaleString()} CFA</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Mise à jour statut */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Mettre à Jour le Statut</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-2">Statut de la Commande</label>
                                          <Select 
                                            defaultValue={orderDetails.orderStatus || 'pending'}
                                            onValueChange={(value) => {
                                              updateOrderMutation.mutate({
                                                orderId: orderDetails.id,
                                                status: { 
                                                  orderStatus: value as any,
                                                  paymentStatus: orderDetails.paymentStatus as any
                                                }
                                              });
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">En Attente</SelectItem>
                                              <SelectItem value="confirmed">Confirmée</SelectItem>
                                              <SelectItem value="preparing">Préparation</SelectItem>
                                              <SelectItem value="shipped">Expédiée</SelectItem>
                                              <SelectItem value="delivered">Livrée</SelectItem>
                                              <SelectItem value="cancelled">Annulée</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-2">Statut du Paiement</label>
                                          <Select 
                                            defaultValue={orderDetails.paymentStatus || 'pending'}
                                            onValueChange={(value) => {
                                              updateOrderMutation.mutate({
                                                orderId: orderDetails.id,
                                                status: { 
                                                  orderStatus: orderDetails.orderStatus as any,
                                                  paymentStatus: value as any
                                                }
                                              });
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">En Attente</SelectItem>
                                              <SelectItem value="paid">Payée</SelectItem>
                                              <SelectItem value="failed">Échouée</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}