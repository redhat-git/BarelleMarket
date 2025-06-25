// server/auth.js
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const session = require('express-session');
const connectPg = require('connect-pg-simple');
const { storage } = require('./storage');
// server/auth.js
require('express');

// Vérification des variables d'environnement
if (!process.env.SESSION_ENV) throw new Error('SESSION_SECRET not found');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not found');

// 🔐 Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 👤 Structure de la session (juste pour documentation, pas de TypeScript en JS pur)
const UserSession = {
  id: String,
  email: String,
  firstName: String,
  lastName: String,
  role: String,
  isB2B: Boolean
};

// 🎯 Middleware session
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    connectString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions_sessions'
  });

  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl
    }
  });
}

// 🔐 Passport + stratégie locale
async function setupAuth(app) {
  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: 'Email ou mot de passe incorrect' });
          }

          if (user.isActive === false) {
            return done(null, false, { message: 'Utilisateur désactivé' });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Email ou mot de passe incorrect' });
          }

          const userSession = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isB2B: user.isB2B || false
          };

          return done(null, userSession);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log('Deserializing user ID:', id);
      const user = await storage.getUser(id);
      if (!user || user.isActive === false) {
        console.log('User not found or inactive:', id);
        return done(null, false);
      }

      const userSession = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isB2B: user.isB2B || false
      };

      console.log('Deserialized user session:', userSession);
      done(null, userSession);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error);
    }
  });

  // 🔓 Déconnexion
  app.post('/api/auth/logout', (req, res) => {
    req.logout(err => {
      if (err) return res.status(401).json({ message: 'Erreur lors de la déconnexion' });
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Déconnexion réussie' });
      });
    });
    app.get('/api/logout', (req, res) => {
      req.logout(err => {
        if (err) return res.status(401).json({ message: 'Erreur lors de la déconnexion' });
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          res.redirect('/');
        });
      });
    });

    // 🧑‍🚀 Récupérer la session utilisateur
    app.get('/api/auth/session', (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Non connecté' });
      }
      res.json({ user: req.user });
    });
  }

// 🛡️ Middleware : vérifier la connexion
const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: 'Non authentifié' });
    }
    next();
  };

  // 🛡️ Middleware : vérifier le rôle
  const requireRole = (roles) => {
    return async (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const userSession = req.user;

      if (!roles.includes(userSession.role)) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      try {
        const user = await storage.getUser(userSession.id);
        if (!user) {
          return res.status(401).json({ message: 'Utilisateur introuvable' });
        }

        req.dbUser = user;
        next();
      } catch (error) {
        console.error('Error dans le middleware requireRole:', error);
        res.status(401).json({ message: 'Erreur serveur' });
      }
    };
  };

  // Raccourcis de rôle
  const adminOnly = requireRole(['admin']);
  const supportOrAdminOnly = requireRole(['admin', 'support']);

  module.exports = {
    hashPassword,
    setupAuth,
    isAuthenticated,
    requireRole,
    adminOnly,
    supportOrAdminOnly
  };