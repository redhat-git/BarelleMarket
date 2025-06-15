export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  userId?: string;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    imageUrl?: string;
    shortDescription?: string;
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}
