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

    async rateProduct(productId: number, newRating: number) {
        // Récupérer le produit
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1)
            .then(res => res[0]);

        if (!product) {
            return null;
        }

        const oldAvg = Number(product.rating) || 0;
        const oldCount = Number(product.reviewCount) || 0;

        const newCount = oldCount + 1;
        const updatedAvg = Math.round(((oldAvg * oldCount + newRating) / newCount) * 10) / 10;

        // Mettre à jour dans la base
        await db
            .update(products)
            .set({
                rating: updatedAvg,
                reviewCount: newCount,
            })
            .where(eq(products.id, productId));

        // Retourne la nouvelle note et nombre d'avis
        return { rating: updatedAvg, reviewCount: newCount };
    }
    // ✅ Ajoute d'autres méthodes selon tes besoins : panier, commandes, etc.
}
