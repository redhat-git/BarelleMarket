// 📄 server/database-storage.ts
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, products, categories } from '../shared/schema';

export class DatabaseStorage {
    // 🔐 Authentification
    async getUserByEmail(email: string) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }

    // 🛍️ Produits
    async getAllProducts() {
        return await db.select().from(products);
    }

    async getFeaturedProducts() {
        return await db.select().from(products).where(eq(products.featured, true));
    }

    async getProductById(id: string) {
        const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
        return result[0] || null;
    }

    // 🗂️ Catégories
    async getAllCategories() {
        return await db.select().from(categories);
    }

    // ✅ Ajoute d'autres méthodes selon tes besoins : panier, commandes, etc.
}
