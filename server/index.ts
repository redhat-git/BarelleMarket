import 'dotenv/config';
import express, { type Request, Response } from "express";
// Update the import path if your routes file is in the same directory as index.ts
import { registerRoutes } from "./routes";
// Update the import path below to the correct location of your vite utilities, or create the vite.ts file if it doesn't exist.
import { setupVite, serveStatic, log } from "./vite";
import { Client } from 'pg';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connexion à PostgreSQL - Utilisation de la base de données Replit
let client: Client;
if (process.env.DATABASE_URL) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  client.connect()
    .then(() => console.log('Connecté à PostgreSQL'))
    .catch(err => console.error('Erreur de connexion PostgreSQL:', err.stack));
} else {
  console.log('DATABASE_URL non configurée - veuillez créer une base de données PostgreSQL dans Replit');
}

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET ?? (() => { throw new Error("SESSION_SECRET is not defined in environment variables."); })(),
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Stratégie Passport
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      if (!client) {
        return done(new Error('Base de données non configurée'));
      }
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];
      if (!user || !await bcrypt.compare(password, user.password)) {
        return done(null, false, { message: 'Identifiants incorrects' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

type User = {
  id: number;
  username: string;
  password: string;
  // add other user fields as needed
};

// Extend Express.User to match your User type
declare module "express-session" {
  interface SessionData {
    passport?: { user: number };
  }
}

declare module "express" {
  interface User {
    id: number;
    username: string;
    password: string;
    // add other user fields as needed
  }
}

passport.serializeUser((user, done) => done(null, (user as User).id));
passport.deserializeUser(async (id, done) => {
  try {
    if (!client) {
      return done(new Error('Base de données non configurée'));
    }
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Middleware de journalisation
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Route de connexion
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Connexion réussie', user: req.user });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, next: express.NextFunction) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // Serve static files or setup Vite based on the environment
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ?? 5000;
  server.listen({
    port,
    host: "127.0.0.1",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
