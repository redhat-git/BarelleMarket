import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
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
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

type Claims = {
  exp?: number;
  [key: string]: unknown;
};

type UserSession = {
  claims?: Claims;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  [key: string]: unknown;
};

function updateUserSession(
  user: UserSession,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims() as Claims;
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: Claims,
) {
  await storage.upsertUser({
    id: String(claims["sub"]),
    email: String(claims["email"]),
    firstName: typeof claims["first_name"] === "string" ? claims["first_name"] : undefined,
    lastName: typeof claims["last_name"] === "string" ? claims["last_name"] : undefined,
    profileImageUrl: typeof claims["profile_image_url"] === "string" ? claims["profile_image_url"] : undefined,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    upsertUser(tokens.claims() ?? {})
      .then(() => verified(null, user))
      .catch((err) => verified(err));
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = req.user as UserSession;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  getOidcConfig()
    .then((config) => client.refreshTokenGrant(config, refreshToken))
    .then((tokenResponse) => {
      updateUserSession(user, tokenResponse);
      return next();
    })
    .catch(() => {
      res.status(401).json({ message: "Unauthorized" });
    });
};

type RequestWithDbUser = Express.Request & { dbUser?: Awaited<ReturnType<typeof storage.getUser>> };

export const requireRole = (requiredRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user as UserSession;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (async () => {
      try {
        const userId = user.claims?.sub;
        if (typeof userId !== "string") {
          return res.status(401).json({ message: "User not authenticated" });
        }
        const dbUser = await storage.getUser(userId);

        if (!dbUser?.isActive) {
          return res.status(403).json({ message: "Account inactive" });
        }

        if (!requiredRoles.includes(dbUser.role ?? 'user')) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Add user info to request for convenience
        (req as RequestWithDbUser).dbUser = dbUser;
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
