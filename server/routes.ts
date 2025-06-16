import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin, requireSupport } from "./auth";
import passport from "passport";
import {
  b2cOrderSchema,
  b2bRegistrationSchema,
  createUserSchema,
  updateOrderStatusSchema,
  createProductSchema
} from "@shared/schema";
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes

  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { claims: { sub: string } })?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/login', (req, res) => {
    const baseUrl = process.env.REPLIT_OAUTH_URL ?? 'https://replit.com/auth/oauth2/authorize';
    const clientId = process.env.REPLIT_CLIENT_ID;
    const redirectUri = process.env.REPLIT_REDIRECT_URI ?? req.protocol + '://' + req.get('host') + '/api/auth/callback';
    const url =
      baseUrl +
      '?client_id=' + encodeURIComponent(clientId ?? '') +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&response_type=code&scope=read:user';
    res.redirect(url);
  });

  app.get('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  });

  // B2B Registration
  app.post('/api/auth/register-b2b', async (req, res) => {
    try {
      const registrationData = b2bRegistrationSchema.parse(req.body);
      const user = await storage.registerB2BUser(registrationData);
      res.json(user);
    } catch (error) {
      console.error("B2B registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // B2B Profile Update
  app.patch('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const profileData = req.body;
      const user = await storage.updateB2BProfile(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(400).json({ message: "Profile update failed" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string;
      const featured = req.query.featured === 'true';

      const products = await storage.getProducts(categoryId, search, featured);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart operations
  app.get('/api/cart', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      interface AuthenticatedUser {
        claims: { sub: string };
      }
      const userId = (req.user as AuthenticatedUser)?.claims?.sub;

      const cartItems = await storage.getCartItems(sessionId, userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/add', async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const sessionId = req.sessionID;
      const userId = (req.user as { claims?: { sub?: string } })?.claims?.sub;

      const cartItem = await storage.addToCart(sessionId, productId, quantity, userId);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch('/api/cart/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete('/api/cart', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const userId = (req.user as { claims?: { sub?: string } })?.claims?.sub;

      await storage.clearCart(sessionId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order operations
  app.post('/api/orders/b2c', async (req, res) => {
    try {
      const orderData = b2cOrderSchema.parse(req.body);
      const sessionId = req.sessionID;

      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const order = await storage.createB2COrder(orderData, cartItems, sessionId);
      res.json(order);
    } catch (error) {
      console.error("Error creating B2C order:", error);
      res.status(400).json({ message: "Failed to create order", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/orders/b2b', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const orderData = req.body;

      // Get cart items
      const cartItems = await storage.getCartItems('', userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const order = await storage.createB2BOrder(userId, orderData, cartItems);
      res.json(order);
    } catch (error) {
      console.error("Error creating B2B order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as { claims: { sub: string } }).claims.sub;

      const order = await storage.getOrderById(id);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Admin Routes

  // User Management
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await storage.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const userData = createUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role, permissions } = req.body;

      const user = await storage.updateUserRole(userId, role, permissions);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  app.patch('/api/admin/users/:id/deactivate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deactivateUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(400).json({ message: "Failed to deactivate user" });
    }
  });

  app.patch('/api/admin/users/:id/activate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.activateUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(400).json({ message: "Failed to activate user" });
    }
  });

  // Product Management
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const productData = createProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;

      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Category Management
  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.patch('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = req.body;

      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(400).json({ message: "Failed to delete category" });
    }
  });

  // Order Management  
  app.get('/api/admin/orders', requireSupport, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await storage.getAllOrders(page, limit, status);
      res.json(result);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/admin/orders/:id/status', requireSupport, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const statusData = updateOrderStatusSchema.parse(req.body);

      const order = await storage.updateOrderStatus(orderId, statusData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.get('/api/admin/orders/:id', requireSupport, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Dashboard Stats
  app.get('/api/admin/stats', requireSupport, async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Create initial admin (for setup purposes)
  app.post('/api/setup/admin', async (req, res) => {
    try {
      const { email, firstName, lastName, setupKey } = req.body;

      // Simple protection - you should change this key
      if (setupKey !== "BARELLE_SETUP_2024") {
        return res.status(403).json({ message: "Invalid setup key" });
      }

      const admin = await storage.createAdminUser(email, firstName, lastName);
      res.json({ message: "Admin créé avec succès", user: admin });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Google OAuth routes (only if configured)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/auth/login' }),
      (req, res) => {
        res.redirect('/');
      }
    );
  }

  // Facebook OAuth routes (only if configured)
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    app.get('/api/auth/facebook',
      passport.authenticate('facebook', { scope: ['email'] })
    );

    app.get('/api/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
      (req, res) => {
        res.redirect('/');
      }
    );
  }

  const httpServer = createServer(app);
  return httpServer;
}