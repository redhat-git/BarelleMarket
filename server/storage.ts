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
  type CreateUser,
  type UpdateOrderStatus,
  type CreateProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // B2B specific operations
  registerB2BUser(registration: B2BRegistration): Promise<User>;
  updateB2BProfile(userId: string, profile: Partial<UpsertUser>): Promise<User>;

  // Admin operations
  getAllUsers(page?: number, limit?: number): Promise<{ users: User[]; total: number }>;
  createUser(userData: CreateUser): Promise<User>;
  updateUserRole(userId: string, role: string, permissions?: Record<string, boolean>): Promise<User>;
  deactivateUser(userId: string): Promise<void>;
  activateUser(userId: string): Promise<void>;

  // Categories management
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(categoryData: { name: string; slug: string; description?: string; imageUrl?: string; isActive?: boolean }): Promise<Category>;
  updateCategory(id: number, categoryData: { name?: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Products management
  getProducts(categoryId?: number, search?: string, featured?: boolean): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  createProduct(productData: CreateProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<CreateProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

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

  // Admin order management
  getAllOrders(page?: number, limit?: number, status?: string): Promise<{ orders: Order[]; total: number }>;
  updateOrderStatus(orderId: number, statusData: UpdateOrderStatus): Promise<Order>;
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    todayOrders: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    provider?: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
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
      role: "user",
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

  // Admin operations
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const [usersData, totalCount] = await Promise.all([
      db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt)),
      db.select({ count: users.id }).from(users)
    ]);

    return {
      users: usersData,
      total: totalCount.length
    };
  }

  async createUser(userData: CreateUser): Promise<User> {
    const newUserData: UpsertUser = {
      ...userData,
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      isB2B: userData.role !== "user",
      isActive: true,
    };

    const [user] = await db.insert(users).values(newUserData).returning();
    return user;
  }

  async updateUserRole(userId: string, role: string, permissions?: Record<string, boolean>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        permissions,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deactivateUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async activateUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createAdminUser(email: string, firstName: string, lastName: string): Promise<User> {
    const adminData: UpsertUser = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      email,
      firstName,
      lastName,
      role: "admin",
      isActive: true,
      isB2B: false,
    };

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user to admin
      const [updatedUser] = await db
        .update(users)
        .set({
          role: "admin",
          isActive: true,
          firstName,
          lastName,
          updatedAt: new Date()
        })
        .where(eq(users.email, email))
        .returning();
      return updatedUser;
    } else {
      // Create new admin user
      const [newUser] = await db.insert(users).values(adminData).returning();
      return newUser;
    }
  }

  // Categories management
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

  async createCategory(categoryData: { name: string; slug: string; description?: string; imageUrl?: string; isActive?: boolean }): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: number, categoryData: { name?: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, id));
  }

  // Products
  async getProducts(categoryId?: number, search?: string, featured?: boolean): Promise<Product[]> {
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

  async createProduct(productData: CreateProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...productData,
      rating: "0.0",
      reviewCount: 0,
    }).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<CreateProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
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
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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

    const orderNumber = `B2B-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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
      paymentMethod: orderData.paymentMethod ?? 'bank',
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

  // Admin order management
  async getAllOrders(page: number = 1, limit: number = 20, status?: string): Promise<{ orders: Order[]; total: number }> {
    const offset = (page - 1) * limit;

    const conditions = status ? [eq(orders.orderStatus, status)] : [];
    const baseQuery = db.select().from(orders).where(and(...conditions));
    const countQuery = db.select({ count: orders.id }).from(orders).where(and(...conditions));

    const [ordersData, totalCount] = await Promise.all([
      baseQuery.limit(limit).offset(offset).orderBy(desc(orders.createdAt)),
      countQuery
    ]);

    return {
      orders: ordersData,
      total: totalCount.length
    };
  }

  async updateOrderStatus(orderId: number, statusData: UpdateOrderStatus): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        ...statusData,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    todayOrders: number;
    totalRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue
    ] = await Promise.all([
      db.select({ count: orders.id }).from(orders),
      db.select({ count: orders.id }).from(orders).where(eq(orders.orderStatus, 'pending')),
      db.select({ count: orders.id }).from(orders).where(and(
        eq(orders.orderStatus, 'delivered'),
        eq(orders.createdAt, today)
      )),
      db.select({ sum: orders.total }).from(orders).where(eq(orders.orderStatus, 'delivered'))
    ]);

    return {
      totalOrders: totalOrders.length,
      pendingOrders: pendingOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue: totalRevenue.reduce((sum, order) => sum + parseFloat(order.sum || '0'), 0)
    };
  }
}

export const storage = new DatabaseStorage();