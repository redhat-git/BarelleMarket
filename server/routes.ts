import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import multer from "multer";
import { setupAuth, hashPassword, isAuthenticated, requireAdmin, requireSupport } from "./auth";
import passport from "passport";
import {
  b2cOrderSchema,
  b2bRegistrationSchema,
  createUserSchema,
  updateOrderStatusSchema,
  createProductSchema,
  registerSchema,
  loginSchema,
  updateProductSchema
} from '../shared/schema';
import express from "express";
import path from "path";
const __filename = __filename;
const __dirname = path.dirname(__filename);

const app = express(); // d'abord tu crées l'application Express

// Ensuite tu déclares les fichiers statiques
app.use('/produits', express.static(path.join(__dirname, 'produits')));

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes

  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userSession = req.user as any;
      console.log("User session in /api/auth/user:", userSession);

      const dbUser = await storage.getUser(userSession.id);
      if (!dbUser) {
        console.log("User not found in database:", userSession.id);
        return res.status(404).json({ message: "User not found" });
      }

      const userResponse = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        isB2B: dbUser.isB2B,
        claims: { sub: dbUser.id }
      };

      console.log("Returning user data:", userResponse);
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Inscription
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log("Registration attempt:", req.body);
      const userData = registerSchema.parse(req.body);

      // Vérifier si l'email existe déjà
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Hacher le mot de passe
      const hashedPassword = await hashPassword(userData.password);

      // Créer l'utilisateur
      const user = await storage.createLocalUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      console.log("User created successfully:", user.id);
      res.status(201).json({
        message: "Inscription réussie",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: "Erreur lors de l'inscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Connexion
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const loginData = loginSchema.parse(req.body);

      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error("Erreur Passport:", err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Email ou mot de passe incorrect" });
        }

        req.logIn(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Erreur lors de la connexion" });
          }

          console.log("User logged in successfully:", user);
          res.json({
            message: "Connexion réussie",
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isB2B: user.isB2B
            }
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // B2B Registration
  app.post('/api/auth/register-b2b', async (req, res) => {
    try {
      const registrationData = b2bRegistrationSchema.parse(req.body);

      // Vérifier si l'email existe déjà
      const existingUser = await storage.getUserByEmail(registrationData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Hacher le mot de passe
      const hashedPassword = await hashPassword(registrationData.password);

      const user = await storage.registerB2BUser({
        ...registrationData,
        password: hashedPassword
      });

      res.json({ message: "Inscription B2B réussie. En attente d'approbation.", user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("B2B registration error:", error);
      res.status(400).json({ message: "Erreur lors de l'inscription", error: error instanceof Error ? error.message : String(error) });
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

  app.post('/api/products/:id/rate', async (req, res) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const { rating } = req.body;

      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La note doit être un nombre entre 1 et 5" });
      }

      const updatedProduct = await storage.rateProduct(productId, rating);

      if (!updatedProduct) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      res.json({
        message: "Note enregistrée",
        nouvelle_moyenne: updatedProduct.rating,
        nombre_avis: updatedProduct.review_count,
      });
    } catch (error) {
      console.error("Erreur lors de la notation du produit :", error);
      res.status(500).json({ message: "Erreur serveur" });
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

      console.log("Cart add request body:", req.body);
      console.log("Session ID:", req.sessionID);
      console.log("User authenticated:", req.isAuthenticated());

      if (!productId || !Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ message: "ID produit invalide" });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Quantité invalide" });
      }

      // Vérifier que le produit existe
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      const sessionId = req.sessionID;
      const userId = req.isAuthenticated() ? (req.user as any)?.id : undefined;

      console.log("Adding to cart:", { sessionId, userId, productId, quantity });

      const cartItem = await storage.addToCart(sessionId, productId, quantity, userId);
      console.log("Cart item added:", cartItem);

      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({
        message: "Erreur lors de l'ajout au panier",
        error: error instanceof Error ? error.message : String(error)
      });
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
      const user = req.user as any;
      const userId = user?.claims?.sub ?? user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
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

  app.post('/api/admin/users/:id/deactivate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deactivateUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(400).json({ message: "Failed to deactivate user" });
    }
  });

  app.post('/api/admin/users/:id/activate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.activateUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(400).json({ message: "Failed to activate user" });
    }
  });

  app.get('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Déconnexion réussie" });
      });
    });
  });

  // Product Management
  const upload = multer();

  // Sert les fichiers du dossier "produits" statiquement
  app.use("/produits", express.static(path.join(__dirname, "produits")));

  // POST - Créer un produit
  app.post('/api/admin/products', requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        price: Number(req.body.price),
        b2bPrice: req.body.b2bPrice ? Number(req.body.b2bPrice) : undefined,
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
        categoryId: Number(req.body.categoryId),
        stockQuantity: req.body.stockQuantity ? Number(req.body.stockQuantity) : 0,
        isFeatured: req.body.isFeatured === "true",
      };

      const uploadDir = path.join(__dirname, "produits");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      let imageUrl: string | undefined = undefined;
      if (req.file) {
        const filename = `${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        imageUrl = `${req.protocol}://${req.get("host")}/produits/${filename}`;
      }

      const productData = createProductSchema.parse({
        ...parsedBody,
        imageUrl,
      });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({
        message: "Failed to create product",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // PATCH - Mettre à jour un produit
  app.patch(
    "/api/admin/products/:id",
    requireAdmin,
    upload.single("image"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);

        const parsedBody = {
          ...req.body,
          price: Number(req.body.price),
          b2bPrice: req.body.b2bPrice ? Number(req.body.b2bPrice) : undefined,
          originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
          categoryId: Number(req.body.categoryId),
          stockQuantity: req.body.stockQuantity ? Number(req.body.stockQuantity) : 0,
          isFeatured: req.body.isFeatured === "true",
        };

        const uploadDir = path.join(__dirname, "produits");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const host = req.get("host");       // exemple: localhost:5000
        const protocol = req.protocol;      // http ou https

        let imageUrl: string | undefined = undefined;

        if (req.file) {
          const filename = `${Date.now()}_${req.file.originalname}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, req.file.buffer);

          // Génère une URL complète valide
          imageUrl = `${protocol}://${host}/produits/${filename}`;
        } else if (req.body.imageUrl) {
          imageUrl = req.body.imageUrl;
        }


        // Appliquer le schéma Zod
        const productData = updateProductSchema.parse({
          ...parsedBody,
          ...(imageUrl ? { imageUrl } : {}),
        });

        const updated = await storage.updateProduct(id, productData);
        res.json(updated);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(400).json({ message: "Failed to update product" });
      }
    }
  );

  // DELETE - Supprimer un produit
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
  app.get('/api/admin/orders', isAuthenticated, async (req, res) => {
    try {
      const userSession = req.user as any;
      console.log('Admin orders - User session:', userSession);

      const userId = userSession?.id || userSession?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non identifié" });
      }

      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (dbUser.role !== 'admin' && dbUser.role !== 'support') {
        return res.status(403).json({ message: "Accès refusé - rôle insuffisant" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await storage.getAllOrders(page, limit, status || undefined);


      console.log("Nombre de commandes envoyées :", result.orders.length);
      console.log("Exemple de commande :", result.orders.orders[0]); // ou result.orders[0]
      console.log("Total commandes :", result.total);


      res.json({
        orders: result,
        total: result.length
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/admin/orders/:id/status', isAuthenticated, async (req, res) => {
    try {
      const userSession = req.user as any;
      const userId = userSession?.id ?? userSession?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non identifié" });
      }

      const dbUser = await storage.getUser(userId);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'support')) {
        return res.status(403).json({ message: "Accès refusé - rôle insuffisant" });
      }

      const orderId = parseInt(req.params.id);
      console.log('Received PATCH body:', JSON.stringify(req.body, null, 2)); // Ajout du log
      const statusData = updateOrderStatusSchema.parse(req.body);

      const order = await storage.updateOrderStatus(orderId, statusData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.get('/api/admin/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const userSession = req.user as any;
      const userId = userSession?.id ?? userSession?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non identifié" });
      }

      const dbUser = await storage.getUser(userId);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'support')) {
        return res.status(403).json({ message: "Accès refusé - rôle insuffisant" });
      }

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
  app.get('/api/admin/stats', isAuthenticated, async (req, res) => {
    try {
      const userSession = req.user as any;
      const userId = userSession?.id ?? userSession?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non identifié" });
      }

      const dbUser = await storage.getUser(userId);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'support')) {
        return res.status(403).json({ message: "Accès refusé - rôle insuffisant" });
      }

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

  // Route pour créer le premier compte admin (à utiliser une seule fois)
  app.post("/api/init-admin", async (req: Request, res: Response) => {
    try {
      // Vérifier s'il y a déjà un admin
      const existingAdmin = await storage.getUserByRole("admin");
      if (existingAdmin) {
        return res.status(400).json({ error: "Un administrateur existe déjà" });
      }

      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
      }

      const hashedPassword = await hashPassword(password);

      const adminUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "admin"
      });

      res.json({
        message: "Compte administrateur créé avec succès",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role
        }
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'admin:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // 🧠 Récupérer la session utilisateur
  app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non connecté" });
    }
    res.json({ user: req.user });
  });

  // Endpoint pour récupérer les informations utilisateur
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userSession = req.user as any;
      console.log("User session in /api/auth/user:", userSession);

      const userData = {
        id: userSession.id,
        email: userSession.email,
        firstName: userSession.firstName,
        lastName: userSession.lastName,
        role: userSession.role,
        isB2B: userSession.isB2B,
        claims: { sub: userSession.id }
      };

      console.log("Returning user data:", userData);
      res.json(userData);
    } catch (error) {
      console.error("Error in /api/auth/user:", error);
      res.status(500).json({ message: "Erreur serveur" });
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