import { db } from "./db";
import { categories, products, users } from "@shared/schema";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create categories
    const categoryData = [
      {
        name: "Spiritueux",
        slug: "spiritueux",
        description: "Spiritueux ivoiriens authentiques",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Jus Naturels",
        slug: "jus-naturels",
        description: "Jus de fruits naturels de Côte d'Ivoire",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Cigares",
        slug: "cigares",
        description: "Cigares de qualité premium",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Accessoires",
        slug: "accessoires",
        description: "Accessoires et articles complémentaires",
        imageUrl: null,
        isActive: true,
      },
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();
    console.log(`✅ Categories ensured in database`);

    // Get existing categories
    const existingCategories = await db.select().from(categories);

    // Create sample products
    const productData = [
      {
        name: "Bangui Premium",
        slug: "bangui-premium",
        description: "Spiritueux ivoirien de qualité supérieure, distillé selon les méthodes traditionnelles.",
        shortDescription: "Spiritueux premium ivoirien authentique",
        price: "25000",
        imageUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400",
        categoryId: existingCategories.find(c => c.slug === 'spiritueux')?.id || 1,
        rating: "4.8",
        reviewCount: 12,
        stockQuantity: 50,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Jus de Bissap Naturel",
        slug: "jus-bissap-naturel",
        description: "Jus de bissap 100% naturel, riche en vitamines et antioxydants.",
        shortDescription: "Boisson rafraîchissante aux fleurs d'hibiscus",
        price: "3500",
        imageUrl: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=400",
        categoryId: existingCategories.find(c => c.slug === 'jus-naturels')?.id || 2,
        rating: "4.6",
        reviewCount: 28,
        stockQuantity: 120,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Jus de Gingembre",
        slug: "jus-gingembre",
        description: "Jus de gingembre frais aux propriétés digestives et énergisantes.",
        shortDescription: "Boisson épicée revitalisante",
        price: "4000",
        imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400",
        categoryId: existingCategories.find(c => c.slug === 'jus-naturels')?.id || 2,
        rating: "4.7",
        reviewCount: 15,
        stockQuantity: 80,
        isFeatured: false,
        isActive: true,
      },
      {
        name: "Cigare Artisanal Ivoirien",
        slug: "cigare-artisanal-ivoirien",
        description: "Cigare premium fabriqué artisanalement avec du tabac ivoirien sélectionné.",
        shortDescription: "Cigare artisanal de qualité supérieure",
        price: "8500",
        imageUrl: "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400",
        categoryId: existingCategories.find(c => c.slug === 'cigares')?.id || 3,
        rating: "4.9",
        reviewCount: 8,
        stockQuantity: 25,
        isFeatured: true,
        isActive: true,
      },
      {
        name: "Set de Dégustation",
        slug: "set-degustation",
        description: "Ensemble complet pour la dégustation de spiritueux avec verres et accessoires.",
        shortDescription: "Kit complet pour dégustation professionnelle",
        price: "15000",
        imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
        categoryId: existingCategories.find(c => c.slug === 'accessoires')?.id || 4,
        rating: "4.5",
        reviewCount: 6,
        stockQuantity: 30,
        isFeatured: false,
        isActive: true,
      },
    ];

    const insertedProducts = await db.insert(products).values(productData).onConflictDoNothing().returning();
    console.log(`✅ Products ensured in database`);

    // Create admin user
    const adminUser = {
      id: "admin_barelle_2025",
      email: "admin@barelle.ci",
      firstName: "Admin",
      lastName: "Barelle",
      profileImageUrl: null,
      companyName: "Barelle Distribution",
      companyType: "Distribution",
      phone: "+225 01 02 03 04 05",
      address: "Abidjan, Côte d'Ivoire",
      city: "Abidjan",
      role: "admin",
      isB2B: true,
      isActive: true,
      permissions: JSON.stringify({
        users: ["create", "read", "update", "delete"],
        products: ["create", "read", "update", "delete"],
        orders: ["create", "read", "update", "delete"],
        categories: ["create", "read", "update", "delete"],
      }),
    };

    const insertedAdmin = await db.insert(users).values(adminUser).returning();
    console.log(`✅ Created admin user: ${insertedAdmin[0].email}`);

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seed()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seed };