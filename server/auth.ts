import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Étendre Express pour inclure dbUser
declare module "express-serve-static-core" {
  interface Request {
    dbUser?: Awaited<ReturnType<typeof storage.getUser>>;
  }
}

// Vérification des variables d'environnement
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET manquante");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante");

// 🔐 Hachage mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 👤 Structure de la session
interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isB2B: boolean;
}

// 🎯 Middleware session
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// 🔐 Passport + stratégie locale
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Email ou mot de passe incorrect" });
          }

          if (user.isActive === false) {
            return done(null, false, { message: "Compte désactivé" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Email ou mot de passe incorrect" });
          }

          const userSession: UserSession = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role!,
            isB2B: user.isB2B || false,
          };

          return done(null, userSession);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      console.log("Deserializing user ID:", id);
      const user = await storage.getUser(id);
      if (!user || user.isActive === false) {
        console.log("User not found or inactive:", id);
        return cb(null, false);
      }

      const userSession: UserSession = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role!,
        isB2B: user.isB2B || false,
      };

      console.log("Deserialized user session:", userSession);
      cb(null, userSession);
    } catch (error) {
      console.error("Deserialization error:", error);
      cb(null, false);
    }
  });

  // 🔓 Déconnexion
  app.post("/api/auth/logout", (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Déconnexion réussie" });
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  });

  // 🧠 Récupérer la session utilisateur
  app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non connecté" });
    }
    res.json({ user: req.user });
  });
}

// 🛡️ Middleware : vérifier la connexion
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
};

// 🛡️ Middleware : vérifier le rôle
export const requireRole = (roles: string[]): RequestHandler => {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userSession = req.user as UserSession;
    
    if (!roles.includes(userSession.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    try {
      const user = await storage.getUser(userSession.id);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur introuvable" });
      }

      req.dbUser = user;
      next();
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
};

// Raccourcis de rôle
export const requireAdmin = requireRole(["admin"]);
export const requireSupport = requireRole(["admin", "support"]);
