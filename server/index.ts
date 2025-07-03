require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { registerRoutes } = require('./routes');
const { serveStatic, setupVite, log } = require('./vite');
const { db, products } = require('./db');
const { setupAuth } = require('./auth');

const app = express();

app.set('trust proxy', 1); // Trust first proxy (for Heroku, etc.)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors({
  origin: 'https://barelle-distribution.com',
  credentials: true,
}));


// 🧾 Middleware de journalisation API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

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
      if (logLine.length > 100) logLine = logLine.slice(0, 99) + '…';
      log(logLine);
    }
  });

  next();
});

// ✅ Vérification connexion base
db.select().from(products).limit(1)
  .then(() => log('✅ Connexion à la base de données réussie'))
  .catch(err => {
    console.error('❌ Erreur de connexion à la base :', err);
    process.exit(1);
  });

(async () => {
  // 🔐 Auth & session
  await setupAuth(app);

  // 📦 Routes
  const server = await registerRoutes(app);

  // 🧯 Gestion des erreurs express
  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message ?? 'Internal Server Error';
    res.status(status).json({ message });
  });

  // ⚡ Vite en dev, fichiers statiques en prod
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 🚀 Lancement du serveur
  const port = parseInt(process.env.PORT ?? '5000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`🚀 Serveur lancé sur http://localhost:${port}`);
  });
})();
