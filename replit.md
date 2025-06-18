
# Barelle Distribution - Plateforme E-commerce

## Vue d’ensemble

Barelle Distribution est une plateforme e-commerce B2B spécialisée dans les produits ivoiriens : spiritueux, jus naturels, cigares et accessoires. L’application est conçue en fullstack avec un frontend React et un backend Express.js, intégrant une authentification Replit pour la gestion des utilisateurs professionnels (B2B) et un système de panier complet.

---

## Architecture du Système

L’application suit une structure monorepo bien organisée entre le frontend et le backend :

 Frontend : React avec TypeScript, Vite pour le développement et la compilation
 Backend : Express.js avec TypeScript
 Base de données : PostgreSQL avec Drizzle ORM pour des requêtes type-safe
 Authentification : Replit Auth via OpenID Connect
 UI : Tailwind CSS avec les composants shadcn/ui pour une interface cohérente
 Déploiement : Configuré pour l’infrastructure autoscale de Replit

---

## Composants Clés

### Frontend (`client/`)

 Routing : Wouter pour un routage léger côté client
 Gestion d’état : TanStack Query pour la gestion du cache et des données serveur
 UI Components : Composants personnalisés basés sur shadcn/ui et Radix UI
 Styles : Tailwind CSS avec palette personnalisée ivoirienne
 Formulaires : React Hook Form + validation Zod

### Backend (`server/`)

 API REST : Serveur Express avec middleware pour logs et gestion d’erreurs
 Base de données : Drizzle ORM avec pool de connexions via Neon
 Auth : Passport.js avec stratégie OpenID pour Replit Auth
 Sessions : Sessions stockées dans PostgreSQL via connect-pg-simple
 Abstraction de stockage : Interface générique pour les opérations de données

---

## Schéma de la Base de Données (`shared/schema.ts`)

 Utilisateurs : Profils B2B avec infos d’entreprise et données d’authentification
 Produits : Catalogue avec catégories, prix, stock
 Catégories : Classification des produits
 Panier : Système de panier lié à une session ou un utilisateur
 Commandes : Gestion des commandes (B2C et B2B)
 Sessions : Stockage des sessions d’authentification

---

## Flux de Données

1. Connexion : Les utilisateurs B2B s’authentifient via Replit Auth
2. Navigation Produits : Les produits sont récupérés depuis PostgreSQL et mis en cache via TanStack Query
3. Panier : Le panier est lié à l’utilisateur connecté ou à une session anonyme
4. Paiement : Les commandes B2C peuvent être faites sans compte, les commandes B2B nécessitent une connexion
5. Gestion Commandes : Les commandes sont enregistrées avec les détails de chaque article et du client

---

## Dépendances Externes

### Infrastructure et Authentification

 Replit Auth : Fournisseur OpenID Connect
 Neon : PostgreSQL serverless
 Replit : Plateforme de déploiement autoscale

### Bibliothèques Clés

 Base de données : Drizzle ORM, `@neondatabase/serverless`
 Auth : Passport.js, `openid-client`
 Frontend : React, TanStack Query, Wouter
 UI : Radix UI, Tailwind CSS
 Formulaires : React Hook Form, Zod
 Dev : Vite, TypeScript, ESBuild

---

## Stratégie de Déploiement

Déploiement optimisé pour Replit :

 Dév local : `npm run dev` lance Express avec Vite en middleware
 Build : Vite compile le frontend, ESBuild le backend
 Prod : Un seul processus Node.js sert les APIs + les fichiers statiques
 Base de données : Connexion automatique à Neon PostgreSQL
 Environnement : Prévu pour l’autoscaling Replit

Le serveur Express sert à la fois les routes backend et les fichiers frontend compilés.

---

## Derniers Changements

### 🚀 Migration Replit Agent → Replit (18 juin 2025)

 ✅ Migration complète de Replit Agent vers environnement Replit
 ✅ Base de données PostgreSQL configurée et connectée
 ✅ Schéma Drizzle ORM appliqué avec succès
 ✅ Données de test initialisées (catégories, produits, admin)
 ✅ Serveur Express optimisé et fonctionnel
 ✅ Toutes les APIs REST opérationnelles
 ✅ Interface utilisateur accessible et responsive
 ✅ Architecture client/serveur sécurisée

### 📦 PWA & SEO (15 janvier 2025)

 ✅ Application PWA avec Service Worker
 ✅ Fichier manifeste avec icônes et raccourcis
 ✅ SEO optimisé avec meta-tags complets
 ✅ Données structurées JSON-LD pour Google
 ✅ Sitemap XML + robots.txt
 ✅ Page hors-ligne (offline.html)
 ✅ Correction du bug de chargement infini
 ✅ Amélioration performance : preconnect + preload

### ✅ Fonctionnalités déjà implémentées

 Authentification complète avec Replit Auth
 Interface admin (utilisateurs, produits, commandes)
 Rôles (admin, support, utilisateur)
 Catalogue produits avec prix visibles uniquement après sélection
 Panier B2B et B2C
 Base PostgreSQL + schéma Drizzle
 Branding aux couleurs ivoiriennes : jaune et noir

---
