const { decideAccess } = require('../services/accessDecision.service');
const debug = require('debug')('app:access:control');
const createError = require('http-errors');

// Liste des chemins publics (ne nécessitant pas d'authentification)
const PUBLIC_PATHS = [
  // Authentification
  /^\/auth(\/.*)?$/,
  /^\/login(\/.*)?$/,
  /^\/register(\/.*)?$/,

  // Santé et statut
  /^\/health(\/.*)?$/,
  /^\/status(\/.*)?$/,

  // Fichiers statiques
  /^\/static(\/.*)?$/,
  /^\/assets(\/.*)?$/,
  /^\/images(\/.*)?$/,
  /^\/favicon\.ico$/,

  // Documentation
  /^\/docs(\/.*)?$/,
  /^\/api-docs(\/.*)?$/,

  // Autres
  /^\/$/,  // Page d'accueil
  /^\/public(\/.*)?$/,
  /^\/healthz$/,  // Endpoint de santé pour Kubernetes
  /^\/readiness$/  // Endpoint de readiness pour Kubernetes
];

/**
 * Vérifie si un chemin est public
 */
function isPublicPath(path) {
  // Vérification rapide des chemins exacts
  if (path === '/' ||
    path === '/favicon.ico' ||
    path === '/health' ||
    path === '/status') {
    return true;
  }

  // Vérification des préfixes de chemin
  const publicPathPrefixes = [
    '/auth/',
    '/static/',
    '/assets/',
    '/public/',
    '/docs/'
  ];

  if (publicPathPrefixes.some(prefix => path.startsWith(prefix))) {
    return true;
  }

  // Vérification par expressions régulières
  return PUBLIC_PATHS.some(regex => regex.test(path));
}

/**
 * Détermine la permission requise en fonction de la méthode HTTP et du chemin
 */
function determineRequiredPermission(method, path) {
  // Nettoyage du chemin
  const cleanPath = path.replace(/^\/+|\/+$/g, ''); // Supprime les / au début et à la fin

  // Détermination de l'action en fonction de la méthode HTTP
  let action;
  switch (method.toUpperCase()) {
    case 'GET':
      action = 'READ';
      break;
    case 'POST':
      action = 'CREATE';
      break;
    case 'PUT':
    case 'PATCH':
      action = 'UPDATE';
      break;
    case 'DELETE':
      action = 'DELETE';
      break;
    default:
      action = 'EXECUTE';
  }

  // Construction du nom de la permission
  const resource = cleanPath
    .replace(/\//g, '_')  // Remplace les / par _
    .replace(/-/g, '_')    // Remplace les - par _
    .toUpperCase();

  return `${action}_${resource}`;
}

/**
 * Middleware de contrôle d'accès principal
 */
module.exports = async function accessControl(req, res, next) {
  const startTime = process.hrtime();
  const { method, path, headers, session } = req;
  const userAgent = headers['user-agent'] || '';
  const referer = headers.referer || '';
  const ip = headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Journalisation de la requête entrante
  debug(`\n=== [${new Date().toISOString()}] ${method} ${path} ===`);
  debug('Headers:', {
    'user-agent': userAgent,
    referer,
    'x-forwarded-for': ip,
    'x-real-ip': headers['x-real-ip']
  });

  // Vérification des chemins publics
  if (isPublicPath(path)) {
    debug('Accès autorisé: chemin public');
    req.isPublicPath = true;
    return next();
  }

  // Vérification de l'authentification
  if (!session?.user) {
    debug('Accès refusé: utilisateur non authentifié');
    return next(createError(401, {
      code: 'UNAUTHENTICATED',
      message: 'Authentification requise',
      details: {
        action: 'login',
        path: '/auth/login',
        method,
        resource: path
      }
    }));
  }

  const { userId, username, roles = [] } = session.user;

  // Vérification de l'ID utilisateur
  if (!userId) {
    debug('Accès refusé: ID utilisateur manquant dans la session');
    return next(createError(401, {
      code: 'INVALID_SESSION',
      message: 'Session utilisateur invalide',
      details: { username }
    }));
  }

  try {
    // Utilisation du service de décision centralisé
    // Ce service gère TOUT : vérification, détection IP, et LOGGING
    const decision = await decideAccess(req);

    // On attache la décision à la requête pour le contrôleur de debug éventuel
    req.accessDecision = decision;

    debug(`Décision pour ${path}: ${decision.status} (${decision.reason})`);

    // Gestion de la réponse en fonction du statut
    if (decision.status === 'REFUSED') {
      debug('Accès refusé par le service de décision');
      return next(createError(403, {
        code: 'FORBIDDEN',
        message: 'Accès refusé',
        details: {
          reason: decision.reason,
          resource: path,
          method,
          timestamp: new Date().toISOString()
        }
      }));
    }

    // AUTHORIZED ou SUSPICIOUS -> On laisse passer (avec log déjà fait par le service)
    if (decision.status === 'SUSPICIOUS') {
      // On pourrait ajouter un header ou un flag ici si besoin
      debug('Accès SUSPECT mais autorisé (IP nouvelle)');
    }

    return next();

  } catch (error) {
    debug('Erreur critique lors de la vérification des permissions:', error);

    // Journalisation de l'erreur critique
    console.error('Erreur critique dans le contrôle d\'accès:', {
      error: error.message,
      stack: error.stack,
      userId,
      path,
      method,
      timestamp: new Date().toISOString()
    });

    return next(createError(500, {
      code: 'AUTH_SYSTEM_ERROR',
      message: 'Erreur système lors de la vérification des autorisations',
      details: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : {}
    }));
  }
};

// Export pour les tests
module.exports.isPublicPath = isPublicPath;
module.exports.determineRequiredPermission = determineRequiredPermission;