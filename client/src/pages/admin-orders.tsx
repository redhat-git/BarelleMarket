import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  type Order,
  type OrderItem,
  type Product,
  type UpdateOrderStatus,
} from '@shared/schema';
import {
  ShoppingCart,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'wouter';

interface OrderWithItems extends Order {
  orderItems: (OrderItem & { product: Product })[];
}

export default function AdminOrders() {
  console.log('AdminOrders component rendu');
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading, error } = useQuery<{
    orders: Order[];
    total: number;
  }>({
    queryKey: ['/api/admin/orders', page, statusFilter],
    queryFn: async () => {
      console.log('Fetching orders with params:', { page, statusFilter });
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
    
      const url = `/api/admin/orders?${params}`;
      console.log('Fetching URL:', url);
    
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Orders fetched:', JSON.stringify(result, null, 2));
    
        // Improved data validation and normalization
        if (!result || typeof result !== 'object') {
          console.error('Invalid server response:', result);
          throw new Error('Invalid server response');
        }
    
        // If the result has orders array, use it
        if (result.orders && Array.isArray(result.orders)) {
          return {
            orders: result.orders,
            total: result.total || result.orders.length,
          };
        }
    
        // If the result is directly an array
        if (Array.isArray(result)) {
          return {
            orders: result,
            total: result.length,
          };
        }
    
        // If no orders found, return empty
        console.warn('No orders found in response:', result);
        return {
          orders: [],
          total: 0,
        };
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes instead of 0
  });

  const { data: orderDetails } = useQuery<OrderWithItems>({
    queryKey: ['/api/admin/orders', selectedOrder?.id],
    enabled: !!selectedOrder?.id,
    queryFn: async () => {
      if (!selectedOrder?.id) throw new Error('No order selected');
      const url = `/api/admin/orders/${selectedOrder.id}`;
      console.log('Fetching order details URL:', url);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Order details fetched:', JSON.stringify(result, null, 2));

        return result.order || result;
      } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: UpdateOrderStatus }) => {
      return apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, {
        body: JSON.stringify(status),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({ title: 'Order updated successfully' });
    },
    onError: (error: any) => {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En Attente
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmée
          </Badge>
        );
      case 'preparing':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Package className="w-3 h-3 mr-1" />
            Préparation
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3 mr-1" />
            Expédiée
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Livrée
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Annulée
          </Badge>
        );
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

  // Enhanced debug logging
  console.log('Current state:', {
    isLoading,
    error: error?.message,
    ordersData,
    ordersCount: ordersData?.orders?.length,
    statusFilter,
    page,
    hasOrders: !!(ordersData?.orders && ordersData.orders.length > 0),
  });

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <h2 className="text-xl font-semibold mb-2">Loading Error</h2>
                <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] })}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Safe check for orders
  const orders = ordersData?.orders || [];
  const hasOrders = orders.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage all orders</p>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Order List
              {ordersData?.total !== undefined && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({ordersData.total} orders)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Debug info - remove in production */}
            <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
              <strong>Debug:</strong> {orders.length} orders loaded
              {ordersData && (
                <span className="ml-2">
                  - API Response: {JSON.stringify({ 
                    ordersLength: ordersData.orders?.length, 
                    total: ordersData.total 
                  })}
                </span>
              )}
            </div>

            {!hasOrders ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  {statusFilter && statusFilter !== 'all'
                    ? `No orders with status "${statusFilter}"`
                    : "No orders have been placed yet"}
                </p>
                {statusFilter && statusFilter !== 'all' && (
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter('all')}
                    className="mt-4"
                  >
                    Show all orders
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order #</th>
                      <th className="text-left py-3 px-4 hidden sm:table-cell">Customer</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4 hidden md:table-cell">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4 hidden lg:table-cell">Payment</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {order.orderNumber || `#${order.id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('fr-FR')
                              : 'Unknown date'}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <div>
                            <div className="font-medium">
                              {order.customerName || 'Name not available'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerEmail || 'Email not available'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {order.total
                            ? parseFloat(order.total.toString()).toLocaleString()
                            : '0'}{' '}
                          CFA
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge
                            className={
                              order.customerType === 'B2B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {order.customerType || 'B2C'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(order.orderStatus || 'pending')}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {getPaymentStatusBadge(order.paymentStatus || 'pending')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setSelectedOrder(order as OrderWithItems)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order Details{' '}
                                    {order.orderNumber || `#${order.id}`}
                                  </DialogTitle>
                                </DialogHeader>
                                {orderDetails && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">
                                            Customer Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <p>
                                            <strong>Name:</strong>{' '}
                                            {orderDetails.customerName ||
                                              'Not provided'}
                                          </p>
                                          <p>
                                            <strong>Email:</strong>{' '}
                                            {orderDetails.customerEmail ||
                                              'Not provided'}
                                          </p>
                                          <p>
                                            <strong>Phone:</strong>{' '}
                                            {orderDetails.customerPhone ||
                                              'Not provided'}
                                          </p>
                                          <p>
                                            <strong>Type:</strong>{' '}
                                            {orderDetails.customerType || 'B2C'}
                                          </p>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">
                                            Delivery
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <p>
                                            <strong>Address:</strong>{' '}
                                            {orderDetails.deliveryAddress ||
                                              'Not provided'}
                                          </p>
                                          <p>
                                            <strong>City:</strong>{' '}
                                            {orderDetails.deliveryCity ||
                                              'Not provided'}
                                          </p>
                                          {orderDetails.deliveryDistrict && (
                                            <p>
                                              <strong>District:</strong>{' '}
                                              {orderDetails.deliveryDistrict}
                                            </p>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">
                                          Ordered Products
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          {orderDetails.orderItems?.map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                            >
                                              <div>
                                                <p className="font-medium">
                                                  {item.productName ||
                                                    'Product without name'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  Quantity: {item.quantity}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-medium">
                                                  {parseFloat(
                                                    item.subtotal || '0',
                                                  ).toLocaleString()}{' '}
                                                  CFA
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {parseFloat(
                                                    item.productPrice?.toString() ||
                                                    '0',
                                                  ).toLocaleString()}{' '}
                                                  CFA/unit
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                          <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>
                                              {parseFloat(
                                                orderDetails.subtotal?.toString() ||
                                                '0',
                                              ).toLocaleString()}{' '}
                                              CFA
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Delivery fee:</span>
                                            <span>
                                              {parseFloat(
                                                orderDetails.deliveryFee?.toString() ||
                                                '0',
                                              ).toLocaleString()}{' '}
                                              CFA
                                            </span>
                                          </div>
                                          <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>
                                              {parseFloat(
                                                orderDetails.total?.toString() ||
                                                '0',
                                              ).toLocaleString()}{' '}
                                              CFA
                                            </span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Update Status</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium mb-2">Order Status</label>
                                            <Select
                                              value={orderDetails.orderStatus || 'pending'}
                                              onValueChange={(value: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled') => {
                                                console.log('Updating orderStatus:', value);
                                                updateOrderMutation.mutate({
                                                  orderId: orderDetails.id,
                                                  status: {
                                                    orderStatus: value,
                                                    paymentStatus: orderDetails.paymentStatus || 'pending',
                                                  },
                                                });
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-2">Payment Status</label>
                                            <Select
                                              value={orderDetails.paymentStatus || 'pending'}
                                              onValueChange={(value: 'pending' | 'paid' | 'failed') => {
                                                console.log('Updating paymentStatus:', value);
                                                updateOrderMutation.mutate({
                                                  orderId: orderDetails.id,
                                                  status: {
                                                    orderStatus: orderDetails.orderStatus || 'pending',
                                                    paymentStatus: value,
                                                  },
                                                });
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}