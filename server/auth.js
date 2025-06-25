const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const session = require('express-session');
const connectPg = require('connect-pg-simple');
const storageModule = require('./storage');
const storage = storageModule.storage || storageModule.default?.storage;

console.log('storageModule =', storageModule);


// 🔐 Vérification des variables d'environnement
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET manquante');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante');

// 🔐 Hachage de mot de passe
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 🎯 Middleware session avec store PostgreSQL
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // true en production, false en développement
      maxAge: sessionTtl,
      sameSite: isProduction ? 'none' : 'lax', // 'none' en prod, 'lax' en dev
    },
  });
}

// 🔐 Initialisation Passport + stratégie locale
async function setupAuth(app) {
  app.set('trust proxy', 1); // important sur Render
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          console.log('🔐 Tentative de connexion pour:', email);

          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            console.log('❌ Utilisateur non trouvé ou pas de mot de passe');
            return done(null, false, { message: 'Email ou mot de passe incorrect' });
          }

          if (user.isActive === false) {
            console.log('❌ Compte désactivé');
            return done(null, false, { message: 'Compte désactivé' });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            console.log('❌ Mot de passe incorrect');
            return done(null, false, { message: 'Email ou mot de passe incorrect' });
          }

          const userSession = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isB2B: user.isB2B || false,
          };

          console.log('✅ Connexion réussie pour:', email);
          return done(null, userSession);
        } catch (error) {
          console.error('💥 Erreur lors de l\'authentification:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('📝 Sérialisation utilisateur:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log('🔍 Désérialisation utilisateur:', id);
      const user = await storage.getUser(id);
      if (!user || user.isActive === false) {
        console.log('❌ Utilisateur non trouvé ou désactivé lors de la désérialisation');
        return done(null, false);
      }

      const userSession = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isB2B: user.isB2B || false,
      };

      console.log('✅ Désérialisation réussie');
      done(null, userSession);
    } catch (error) {
      console.error('💥 Erreur lors de la désérialisation:', error);
      done(error);
    }
  });

  // 🧠 Récupérer la session utilisateur
  app.get('/api/auth/session', (req, res) => {
    console.log('🔍 Vérification session, isAuthenticated:', req.isAuthenticated());
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non connecté' });
    }
    res.json({ user: req.user });
  });

  // 🔓 Login (à ne pas oublier !)
  app.post('/api/auth/login', (req, res, next) => {
    console.log('🔐 Tentative de login avec:', req.body.email);

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('💥 Erreur serveur lors du login:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!user) {
        console.log('❌ Échec de l\'authentification:', info?.message);
        return res.status(401).json({ message: info?.message || 'Identifiants incorrects' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('💥 Erreur lors de la création de session:', err);
          return res.status(500).json({ message: 'Erreur session' });
        }

        console.log('✅ Login réussi, session créée');
        return res.json({ user });
      });
    })(req, res, next);
  });

  // 🔒 Logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Déconnexion réussie' });
      });
    });
  });

  // Redirection côté navigateur (si tu as besoin d'un lien HTML)
  app.get('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    });
  });
}

// 🛡️ Middleware : vérifie si connecté
function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  next();
}

// 🛡️ Middleware : vérifie le rôle
function requireRole(roles) {
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
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
}

// Raccourcis
const requireAdmin = requireRole(['admin']);
const requireSupport = requireRole(['admin', 'support']);

module.exports = {
  hashPassword,
  getSession,
  setupAuth,
  isAuthenticated,
  requireRole,
  requireAdmin,
  requireSupport,
};