
import { db } from "./db";
import { categories, products } from "../shared/schema";

interface ProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  categoryId: number;
  imageUrl?: string;
  isFeatured?: boolean;
  stockQuantity: number;
}

export async function updateCatalog() {
  console.log("🔄 Mise à jour du catalogue BARELLE...");

  // Créer/mettre à jour les catégories
  const categoryMapping = {
    "Spiritueux": 1,
    "Cigares": 2,
    "Vins & Liqueurs": 3,
    "Épicerie Fine": 4,
    "Chocolaterie": 5,
    "Confiturerie": 6,
    "Glaces Artisanales": 7
  };

  // Insérer les catégories
  await db.insert(categories).values([
    { id: 1, name: "Spiritueux", slug: "spiritueux", description: "Spiritueux artisanaux ivoiriens", isActive: true },
    { id: 2, name: "Cigares", slug: "cigares", description: "Cigares 100% ivoiriens", isActive: true },
    { id: 3, name: "Vins & Liqueurs", slug: "vins-liqueurs", description: "Vins de fruits et liqueurs artisanales", isActive: true },
    { id: 4, name: "Épicerie Fine", slug: "epicerie-fine", description: "Produits gastronomiques haut de gamme", isActive: true },
    { id: 5, name: "Chocolaterie", slug: "chocolaterie", description: "Chocolats artisanaux du cacao ivoirien", isActive: true },
    { id: 6, name: "Confiturerie", slug: "confiturerie", description: "Chutneys, jus et confitures naturels", isActive: true },
    { id: 7, name: "Glaces Artisanales", slug: "glaces-artisanales", description: "Glaces aux saveurs locales", isActive: true }
  ]).onConflictDoUpdate({
    target: categories.id,
    set: {
      name: categories.name,
      description: categories.description
    }
  });

  // Produits BARELLE
  const barelleProducts: ProductData[] = [
    // VINQUEUR - Spiritueux
    {
      name: "Whisky Ivoire",
      slug: "whisky-ivoire",
      description: "Whisky artisanal à base de céréales locales (sorgho, mil grillé, maïs bouilli, xérès et cacao). Un spiritueux unique qui célèbre le terroir ivoirien.",
      shortDescription: "Whisky artisanal aux céréales locales",
      price: "100000",
      categoryId: 1,
      isFeatured: true,
      stockQuantity: 50,
      imageUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop"
    },
    {
      name: "Pastis Ivoire",
      slug: "pastis-ivoire",
      description: "Pastis artisanal infusé d'anis étoilé, poivre maniguette, kinkeliba et vétiver. Une création originale aux saveurs locales.",
      shortDescription: "Pastis aux plantes locales",
      price: "100000",
      categoryId: 1,
      stockQuantity: 30,
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop"
    },
    {
      name: "Gin Ivoire",
      slug: "gin-ivoire",
      description: "Gin premium infusé de 21 plantes locales, pamplemousses akpi et grains de paradis. Une explosion de saveurs ivoiriennes.",
      shortDescription: "Gin aux 21 plantes locales",
      price: "75000",
      categoryId: 1,
      isFeatured: true,
      stockQuantity: 40,
      imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop"
    },
    {
      name: "Rhum Blanc Ivoire",
      slug: "rhum-blanc-ivoire",
      description: "Rhum blanc artisanal élaboré à partir de jus de canne à sucre fermenté. Pur et authentique.",
      shortDescription: "Rhum blanc de canne à sucre",
      price: "100000",
      categoryId: 1,
      stockQuantity: 35,
      imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop"
    },
    {
      name: "Vodka Foufou Ivoire",
      slug: "vodka-foufou-ivoire",
      description: "Vodka unique à base d'ignames et bananes, distillée selon des méthodes artisanales traditionnelles.",
      shortDescription: "Vodka artisanale ignames et bananes",
      price: "100000",
      categoryId: 1,
      stockQuantity: 25,
      imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop"
    },

    // FAGOT - Cigares
    {
      name: "Cigare Taabo 1",
      slug: "cigare-taabo-1",
      description: "Premier cigare 100% ivoirien, fabriqué avec du tabac local de Didiévi et Tiébissou, vieilli 100 jours. Excellence artisanale.",
      shortDescription: "Cigare 100% ivoirien vieilli 100 jours",
      price: "15000",
      categoryId: 2,
      isFeatured: true,
      stockQuantity: 100,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },
    {
      name: "Cigare Le Tiébissou",
      slug: "cigare-le-tiebissou",
      description: "Cigare artisanal au tabac de Tiébissou, offrant des arômes complexes et une combustion parfaite.",
      shortDescription: "Cigare au tabac de Tiébissou",
      price: "12000",
      categoryId: 2,
      stockQuantity: 80,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },

    // GRANDS VERSANTS D'AGHIEN - Vins de fruits
    {
      name: "Vin de Bissap",
      slug: "vin-de-bissap",
      description: "Liqueur artisanale à 15% vol. élaborée à partir d'hibiscus. À servir frais pour une expérience rafraîchissante.",
      shortDescription: "Liqueur d'hibiscus à 15% vol.",
      price: "25000",
      categoryId: 3,
      stockQuantity: 60,
      imageUrl: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=300&fit=crop"
    },
    {
      name: "Vin de Passion",
      slug: "vin-de-passion",
      description: "Liqueur de fruit de la passion artisanale, saveur tropicale intense et raffinée.",
      shortDescription: "Liqueur de fruit de la passion",
      price: "25000",
      categoryId: 3,
      stockQuantity: 45,
      imageUrl: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=300&fit=crop"
    },
    {
      name: "Cocoa Elixir",
      slug: "cocoa-elixir",
      description: "Liqueur onctueuse élaborée à partir de cacao ivoirien d'exception, parfaite en digestif ou cocktail.",
      shortDescription: "Liqueur de cacao ivoirien",
      price: "45000",
      categoryId: 3,
      isFeatured: true,
      stockQuantity: 40,
      imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop"
    },

    // LAORANA - Épicerie fine
    {
      name: "Terrine d'Agouti",
      slug: "terrine-agouti",
      description: "Terrine artisanale d'agouti, spécialité gastronomique ivoirienne haut de gamme.",
      shortDescription: "Terrine artisanale d'agouti",
      price: "100000",
      categoryId: 4,
      stockQuantity: 20,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"
    },
    {
      name: "Tapenade des Savanes",
      slug: "tapenade-des-savanes",
      description: "Tartinade artisanale aux saveurs africaines, parfaite pour l'apéritif ou accompagner vos plats.",
      shortDescription: "Tartinade aux saveurs africaines",
      price: "100000",
      categoryId: 4,
      stockQuantity: 50,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"
    },
    {
      name: "Compote Mangue Citron",
      slug: "compote-mangue-citron",
      description: "Compote artisanale de mangue et citron, fraîcheur tropicale garantie.",
      shortDescription: "Compote mangue citron artisanale",
      price: "75000",
      categoryId: 4,
      stockQuantity: 35,
      imageUrl: "https://images.unsplash.com/photo-1571087292801-0d04be97d0dd?w=400&h=300&fit=crop"
    },

    // PEMMS - Chocolaterie
    {
      name: "Coffret Chocolats Assortis",
      slug: "coffret-chocolats-assortis",
      description: "Chocolats artisanaux du cacao à la tablette, coffret de dégustation avec différentes saveurs.",
      shortDescription: "Coffret chocolats artisanaux",
      price: "50000",
      categoryId: 5,
      isFeatured: true,
      stockQuantity: 30,
      imageUrl: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=300&fit=crop"
    },
    {
      name: "Coulant au Cacao Ivoirien",
      slug: "coulant-cacao-ivoirien",
      description: "Coulant au chocolat préparé avec le meilleur cacao ivoirien, texture fondante irrésistible.",
      shortDescription: "Coulant au cacao ivoirien",
      price: "35000",
      categoryId: 5,
      stockQuantity: 25,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
    },

    // ATELIER WAKA - Confiturerie
    {
      name: "Chutney de Mangue Épicée",
      slug: "chutney-mangue-epicee",
      description: "Chutney artisanal 100% naturel, Prix d'Argent des Épicures 2023. Accompagnement parfait pour vos plats.",
      shortDescription: "Chutney primé aux Épicures 2023",
      price: "30000",
      categoryId: 6,
      isFeatured: true,
      stockQuantity: 40,
      imageUrl: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=300&fit=crop"
    },

    // AFRICAN ICE - Glaces artisanales
    {
      name: "Glace Bissap",
      slug: "glace-bissap",
      description: "Glace artisanale à la saveur bissap, rafraîchissante et authentique.",
      shortDescription: "Glace artisanale bissap",
      price: "15000",
      categoryId: 7,
      stockQuantity: 60,
      imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop"
    },
    {
      name: "Glace Baobab",
      slug: "glace-baobab",
      description: "Glace aux saveurs de baobab, fruit emblématique d'Afrique.",
      shortDescription: "Glace au baobab",
      price: "18000",
      categoryId: 7,
      stockQuantity: 45,
      imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop"
    }
  ];

  // Supprimer les anciens produits
  await db.delete(products);

  // Insérer les nouveaux produits
  for (const product of barelleProducts) {
    await db.insert(products).values({
      ...product,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log("✅ Catalogue BARELLE mis à jour avec succès !");
  console.log(`📦 ${barelleProducts.length} produits ajoutés`);
  console.log(`🏷️ ${Object.keys(categoryMapping).length} catégories créées`);
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCatalog().then(() => {
    console.log("Terminé !");
    process.exit(0);
  }).catch((error) => {
    console.error("Erreur:", error);
    process.exit(1);
  });
}
