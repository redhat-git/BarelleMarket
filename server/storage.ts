import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type CartItem,
  type Order,
  type OrderItem,
  type B2COrder,
  type B2BRegistration,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // B2B specific operations
  registerB2BUser(registration: B2BRegistration): Promise<User>;
  updateB2BProfile(userId: string, profile: Partial<UpsertUser>): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Products
  getProducts(categoryId?: number, search?: string, featured?: boolean): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  
  // Cart operations
  getCartItems(sessionId: string, userId?: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(sessionId: string, productId: number, quantity: number, userId?: string): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeCartItem(id: number): Promise<void>;
  clearCart(sessionId: string, userId?: string): Promise<void>;
  
  // Order operations
  createB2COrder(orderData: B2COrder, cartItems: (CartItem & { product: Product })[], sessionId: string): Promise<Order>;
  createB2BOrder(userId: string, orderData: Partial<B2COrder>, cartItems: (CartItem & { product: Product })[]): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async registerB2BUser(registration: B2BRegistration): Promise<User> {
    const userData: UpsertUser = {
      ...registration,
      id: Math.random().toString(), // Will be replaced by actual auth ID
      isB2B: true,
      isActive: true,
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateB2BProfile(userId: string, profile: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category;
  }

  // Products
  async getProducts(categoryId?: number, search?: string, featured?: boolean): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    const conditions = [eq(products.isActive, true)];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }
    
    if (featured) {
      conditions.push(eq(products.isFeatured, true));
    }
    
    return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.isActive, true)));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)));
    return product;
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(limit);
  }

  // Cart operations
  async getCartItems(sessionId: string, userId?: string): Promise<(CartItem & { product: Product })[]> {
    const condition = userId 
      ? eq(cartItems.userId, userId)
      : eq(cartItems.sessionId, sessionId);
      
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(condition)
      .then(rows => rows.map(row => ({ ...row.cart_items, product: row.products })));
  }

  async addToCart(sessionId: string, productId: number, quantity: number, userId?: string): Promise<CartItem> {
    // Check if item already exists in cart
    const condition = userId 
      ? and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
      : and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId));
      
    const [existingItem] = await db.select().from(cartItems).where(condition);
    
    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values({
          sessionId,
          userId,
          productId,
          quantity,
        })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string, userId?: string): Promise<void> {
    const condition = userId 
      ? eq(cartItems.userId, userId)
      : eq(cartItems.sessionId, sessionId);
      
    await db.delete(cartItems).where(condition);
  }

  // Order operations
  async createB2COrder(orderData: B2COrder, cartItemsData: (CartItem & { product: Product })[], sessionId: string): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const subtotal = cartItemsData.reduce((sum, item) => 
      sum + (parseFloat(item.product.price) * item.quantity), 0
    );
    
    const deliveryFee = 2500; // Fixed delivery fee in FCFA
    const total = subtotal + deliveryFee;
    
    const [order] = await db.insert(orders).values({
      orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      deliveryCity: orderData.deliveryCity,
      deliveryDistrict: orderData.deliveryDistrict,
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      total: total.toString(),
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      customerType: 'B2C',
    }).returning();
    
    // Add order items
    const orderItemsData = cartItemsData.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.product.name,
      productPrice: item.product.price,
      quantity: item.quantity,
      subtotal: (parseFloat(item.product.price) * item.quantity).toString(),
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    // Clear cart
    await this.clearCart(sessionId);
    
    return order;
  }

  async createB2BOrder(userId: string, orderData: Partial<B2COrder>, cartItemsData: (CartItem & { product: Product })[]): Promise<Order> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const orderNumber = `B2B-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const subtotal = cartItemsData.reduce((sum, item) => 
      sum + (parseFloat(item.product.price) * item.quantity), 0
    );
    
    const deliveryFee = subtotal > 100000 ? 0 : 2500; // Free delivery for orders over 100,000 FCFA
    const total = subtotal + deliveryFee;
    
    const [order] = await db.insert(orders).values({
      orderNumber,
      userId,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email!,
      customerPhone: user.phone!,
      deliveryAddress: user.address!,
      deliveryCity: user.city!,
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      total: total.toString(),
      paymentMethod: orderData.paymentMethod || 'bank',
      notes: orderData.notes,
      customerType: 'B2B',
    }).returning();
    
    // Add order items
    const orderItemsData = cartItemsData.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.product.name,
      productPrice: item.product.price,
      quantity: item.quantity,
      subtotal: (parseFloat(item.product.price) * item.quantity).toString(),
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    // Clear cart
    await this.clearCart('', userId);
    
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));
    
    return {
      ...order,
      orderItems: items.map(item => ({ ...item.order_items, product: item.products }))
    };
  }
}

export const storage = new DatabaseStorage();
