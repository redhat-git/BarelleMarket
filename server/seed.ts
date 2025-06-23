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

    const categoryMap = new Map(existingCategories.map(cat => [cat.slug, cat.id]));

    await db.insert(products).values(productData).onConflictDoNothing();
    console.log(`✅ Products ensured in database`);

    // Create admin user - Barelle Distribution
    // Using the createAdminUser method directly here will cause a compilation error since `storage` is not defined.
    // I will keep the original implementation for now.
    const adminUser = {
      id: "admin_barelle_2025",
      email: "info@barelle-distribution.com",
      firstName: "Barelle",
      lastName: "Distribution",
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

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
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