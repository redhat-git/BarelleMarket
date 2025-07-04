import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local auth + B2B + Admin
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // hash du mot de passe
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").default("local"), // local, google, facebook
  // B2B specific fields
  companyName: varchar("company_name"),
  companyType: varchar("company_type"), // restaurant, bar, hotel, retail, etc
  siret: varchar("siret"),
  rccm: varchar("rccm"), // Registre du Commerce et du Crédit Mobilier
  address: text("address"),
  city: varchar("city"),
  phone: varchar("phone"),
  secondContactName: varchar("second_contact_name"),
  secondContactPhone: varchar("second_contact_phone"),
  isB2B: boolean("is_b2b").default(false),
  isActive: boolean("is_active").default(true),
  // Admin & Support roles
  role: varchar("role").default("user"), // user, support, admin
  permissions: jsonb("permissions"), // specific permissions for fine-grained access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 300 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Prix B2C
  b2bPrice: decimal("b2b_price", { precision: 10, scale: 2 }), // Prix B2B (réduit)
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: varchar("image_url"),
  additionalImages: jsonb("additional_images"), // array of image URLs
  specifications: jsonb("specifications"), // flexible product specs
  stockQuantity: integer("stock_quantity").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull(), // for guest users
  userId: varchar("user_id").references(() => users.id), // for logged in B2B users
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  // B2C customer info (for guest checkout)
  customerName: varchar("customer_name"),
  customerEmail: varchar("customer_email"),
  customerPhone: varchar("customer_phone"),
  // B2B user reference
  userId: varchar("user_id").references(() => users.id),
  // Delivery address
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: varchar("delivery_city").notNull(),
  deliveryDistrict: varchar("delivery_district"),
  // Order details
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // mobile, cash, bank
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, failed
  orderStatus: varchar("order_status").default("pending"), // pending, confirmed, preparing, shipped, delivered, cancelled
  notes: text("notes"),
  customerType: varchar("customer_type").notNull(), // B2C or B2B
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: varchar("product_name").notNull(), // snapshot at time of order
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// B2C Order schema (for guest checkout)
export const b2cOrderSchema = z.object({
  customerName: z.string().min(2, "Le nom est requis"),
  customerEmail: z.string().email("Email invalide"),
  customerPhone: z.string().min(8, "Numéro de téléphone invalide"),
  deliveryAddress: z.string().min(10, "Adresse de livraison requise"),
  deliveryCity: z.string().min(2, "Ville requise"),
  deliveryDistrict: z.string().optional(),
  paymentMethod: z.enum(["mobile", "cash", "bank"]),
  notes: z.string().optional(),
});

// Schémas d'authentification locale
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// B2B Registration schema
export const b2bRegistrationSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  companyType: z.string().min(2, "Type d'entreprise requis"),
  rccm: z.string().min(1, "Numéro RCCM requis"),
  siret: z.string().optional(),
  address: z.string().min(10, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  secondContactName: z.string().min(2, "Nom du second contact requis"),
  secondContactPhone: z.string().min(8, "Téléphone du second contact requis"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Admin schemas
export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe requis"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  role: z.enum(["user", "support", "admin"]),
  companyName: z.string().optional(),
  companyType: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Nom du produit requis"),
  slug: z.string().min(2, "Slug requis"),
  description: z.string().min(10, "Description requise"),
  shortDescription: z.string().max(300).optional(),

  price: z.number().min(0.01, "Prix B2C requis"), // au moins 0.01
  b2bPrice: z.number().min(0.01, "Prix B2B requis").optional(),
  originalPrice: z.number().min(0).optional(),

  categoryId: z.number().min(1, "Catégorie requise"),
  imageUrl: z.string().url().optional(),
  additionalImages: z.array(z.string().url()).optional(),
  specifications: z.record(z.string()).optional(),

  stockQuantity: z.number().min(0).default(0),
  isFeatured: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  slug: z.string().min(2, "Le slug est requis"),
  description: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  price: z.number(),
  b2bPrice: z.number().optional(),
  originalPrice: z.number().optional(),
  stockQuantity: z.number(),
  categoryId: z.number(),
  isFeatured: z.boolean(),
  // 🔁 change ceci :
  imageUrl: z.string().min(1).optional(), // ✅ accepte les chemins relatifs aussi
});



// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type B2COrder = z.infer<typeof b2cOrderSchema>;
export type B2BRegistration = z.infer<typeof b2bRegistrationSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type Register = z.infer<typeof registerSchema>;
export type Login = z.infer<typeof loginSchema>;