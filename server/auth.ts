import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Étendre l'interface Request d'Express pour inclure dbUser
declare module "express-serve-static-core" {
  interface Request {
    dbUser?: Awaited<ReturnType<typeof storage.getUser>>;
  }
}

// Vérifier les variables d'environnement critiques
if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}
if (!process.env.DATABASE_URL) {
  throw new Error("Environment variable DATABASE_URL not provided");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 semaine
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
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isB2B: boolean;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Stratégie locale (email/mot de passe)
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Compte créé avec un service externe' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        const userSession: UserSession = {
          id: user.id,
          email: user.email!,
          firstName: user.firstName!,
          lastName: user.lastName!,
          role: user.role!,
          isB2B: user.isB2B || false,
        };

        return done(null, userSession);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: UserSession, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return cb(null, false);
      }

      const userSession: UserSession = {
        id: user.id,
        email: user.email!,
        firstName: user.firstName!,
        lastName: user.lastName!,
        role: user.role!,
        isB2B: user.isB2B || false,
      };

      cb(null, userSession);
    } catch (error) {
      cb(error);
    }
  });

  // Route de déconnexion
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ message: "Déconnexion réussie" });
    });
  });
}

// Middleware pour vérifier si authentifié
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
};

export const requireRole = (requiredRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user = req.user as UserSession;

    if (!requiredRoles.includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Ajouter l'utilisateur à la requête pour un accès facile
    req.dbUser = user as any;
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireSupport = requireRole(['admin', 'support']);

