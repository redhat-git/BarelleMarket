// server/index.ts
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { db } from './db';
import { products } from '@shared/schema';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de journalisation API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + '…';
      log(logLine);
    }
  });

  next();
});

// ✅ Vérification de connexion à la base de données
db.select().from(products).limit(1)
  .then(() => log('✅ Connexion à la base de données réussie'))
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données :', err);
    process.exit(1);
  });

(async () => {
  const server = await registerRoutes(app);

  // Gestion des erreurs Express
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: express.NextFunction) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
  });

  // Setup Vite en dev, sinon fichiers statiques
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT ?? '5000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`🚀 Serveur lancé sur http://localhost:${port}`);
  });
})();
