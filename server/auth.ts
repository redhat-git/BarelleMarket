import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";
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

interface Claims {
  sub?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  profile_image_url?: string;
  picture?: string;
  exp?: number;
  [key: string]: unknown;
}

interface UserSession {
  claims?: Claims;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

async function upsertUser(claims: Claims, provider: string) {
  if (!claims.sub && !claims.id) {
    throw new Error("No user ID provided in claims");
  }
  await storage.upsertUser({
    id: String(claims["sub"] ?? claims.id),
    email: claims["email"] ?? "",
    firstName: claims["first_name"] ?? claims.given_name ?? claims.name?.split(' ')[0] ?? "",
    lastName: claims["last_name"] ?? claims.family_name ?? claims.name?.split(' ')[1] ?? "",
    profileImageUrl: claims["profile_image_url"] ?? claims.picture ?? "",
    provider,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Stratégie Google OAuth (si configurée)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user: UserSession = {
              claims: {
                sub: profile.id,
                email: profile.emails?.[0]?.value,
                given_name: profile.name?.givenName,
                family_name: profile.name?.familyName,
                picture: profile.photos?.[0]?.value,
              },
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            };
            await upsertUser(user.claims ?? {}, 'google');
            done(null, user);
          } catch (error) {
            done(error as Error, false);
          }
        }
      )
    );
  }

  // Stratégie Facebook (si configurée)
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ['id', 'emails', 'name', 'picture'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user: UserSession = {
              claims: {
                sub: profile.id,
                email: profile.emails?.[0]?.value,
                given_name: profile.name?.givenName,
                family_name: profile.name?.familyName,
                picture: profile.photos?.[0]?.value,
              },
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            };
            await upsertUser(user.claims ?? {}, 'facebook');
            done(null, user);
          } catch (error) {
            done(error as Error, false);
          }
        }
      )
    );
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Routes Google Auth
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Routes Facebook Auth
  app.get(
    "/api/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );
  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/api/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Routes login / logout legacy
  app.get("/api/login", (req, res) => {
    res.redirect("/auth/login");
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

// Middleware pour vérifier si authentifié (sans refresh token ici)
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = req.user as UserSession;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Token expiré => accès refusé (pas de refresh token dans cette version simplifiée)
  return res.status(401).json({ message: "Unauthorized" });
};

export const requireRole = (requiredRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user as UserSession;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (async () => {
      try {
        if (!user.claims?.sub) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = user.claims.sub;
        const dbUser = await storage.getUser(userId);
        req.dbUser = dbUser;

        if (!requiredRoles.includes(dbUser?.role ?? 'user')) {
          return res.status(403).json({ message: "Forbidden" });
        }

        return next();
      } catch (error) {
        console.error("Role check error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    })();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireSupport = requireRole(['admin', 'support']);
