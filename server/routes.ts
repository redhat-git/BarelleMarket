import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { b2cOrderSchema, b2bRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // B2B Registration
  app.post('/api/auth/register-b2b', async (req, res) => {
    try {
      const registrationData = b2bRegistrationSchema.parse(req.body);
      const user = await storage.registerB2BUser(registrationData);
      res.json(user);
    } catch (error) {
      console.error("B2B registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  // B2B Profile Update
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user?.claims?.sub;
      
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
      const userId = req.user?.claims?.sub;
      
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
      const userId = req.user?.claims?.sub;
      
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
      res.status(400).json({ message: "Failed to create order", error: error.message });
    }
  });

  app.post('/api/orders/b2b', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
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

  const httpServer = createServer(app);
  return httpServer;
}
