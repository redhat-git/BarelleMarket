require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { registerRoutes } = require('./routes');
const { serveStatic, log } = require('./vite');
const { db, products } = require('./db');  // <- ici on récupère la table products depuis db
const { categories } = require('../shared/schema'); // si besoin

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: 'https://barelle-distribution.com',
  credentials: true,
}));

// Middleware journalisation (identique)

app.use((req, res, next) => {
  // ... ton code de log
  next();
});

// Vérification DB
db.select().from(products).limit(1)
  .then(() => log('✅ Connexion à la base de données réussie'))
  .catch(err => {
    console.error('❌ Erreur de connexion à la base :', err);
    process.exit(1);
  });

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
  });

  if (app.get('env') === 'development') {
    const { setupVite } = require('./vite');
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT ?? '5000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`🚀 Serveur lancé sur http://localhost:${port}`);
  });
})();
