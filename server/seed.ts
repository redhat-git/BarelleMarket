import { db } from "./db";
import { categories, users } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Hasher un mot de passe par défaut
    const password = "barelle2025"; // à changer ensuite
    const hashedPassword = await bcrypt.hash(password, 10);

    const categoryData = [
      {
        name: "Spiritueux et Alcools",
        slug: "spiritueux-et-alcools",
        description: "Spiritueux, rhums arrangés et liqueurs artisanales ivoiriennes",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Vins et Liqueurs de Fruits",
        slug: "vins-et-liqueurs-de-fruits",
        description: "Vins et liqueurs à base de fruits tropicaux de Côte d'Ivoire",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Chocolat et Confiserie",
        slug: "chocolat-et-confiserie",
        description: "Chocolats artisanaux et matières premières chocolatières",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Tabac",
        slug: "tabac",
        description: "Cigares 100% ivoiriens",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Épicerie Fine et Conserves",
        slug: "epicerie-fine-et-conserves",
        description: "Produits gastronomiques ivoiriens : terrines, confitures, chutneys",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Condiments et Produits Culinaires",
        slug: "condiments-et-produits-culinaires",
        description: "Condiments, jus et produits culinaires tropicaux",
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Glaces Artisanales",
        slug: "glaces-artisanales",
        description: "Glaces aux saveurs locales : tamarin, bissap, baobab, bandji",
        imageUrl: null,
        isActive: true,
      },
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();
    console.log(`✅ Categories inserted`);

    const adminUser = {
      id: "admin_barelle_2025",
      email: "info@barelle-distribution.com",
      password: "Cecethan2016", // Mot de passe par défaut à changer
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

    const inserted = await db.insert(users).values(adminUser).returning();
    console.log(`✅ Created admin user: ${inserted[0].email}`);

    console.log("🌱 Seeding complete!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Exécution directe
if (import.meta.url.endsWith(process.argv[1])) {
  seed();
}

export { seed };
