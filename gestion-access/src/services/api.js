import axios from 'axios'
import mockApi from './mockApi'
import { checkDataConsistency, validateAgainstSchema, SCHEMAS } from '../utils/dataConsistency'
import { createLogger } from '../utils/logger'

const logger = createLogger('API')
const validationLogger = createLogger('API/VALIDATION')

// Activez le mode mock en définissant USE_MOCK_API=true
// Ou modifiez cette ligne pour basculer entre mock et vrai backend
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false

// URL du backend depuis les variables d'environnement ou par défaut
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

let api

if (USE_MOCK_API) {
  // Mode MOCK - pour tester sans backend
  logger.info(' Mode MOCK API activé - Le backend n\'est pas utilisé')
  api = mockApi
} else {
  // Mode RÉEL - utilise le vrai backend
  api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    // IMPORTANT : Axios envoie automatiquement les cookies de session
    // Le backend utilise Express sessions (cookies), pas de headers X-User-Id
    withCredentials: true,
    timeout: 10000 // Timeout de 10 secondes
  })

  // Intercepteur de requête amélioré
  api.interceptors.request.use(
    (config) => {
      // Ajout d'un identifiant unique pour le suivi des requêtes
      const requestId = Math.random().toString(36).substring(2, 9)
      config.metadata = { startTime: new Date(), requestId }

      // Log des requêtes détaillé
      if (logger.group(`→ ${config.method?.toUpperCase()} ${config.url} (${requestId})`)) {
        logger.debug('Headers:', config.headers)
        if (config.data) logger.debug('Data:', config.data)
        logger.groupEnd()
      }
      return config
    },
    (error) => {
      logger.error('Erreur de requête:', error)
      return Promise.reject(error)
    }
  )

  // Validation des données reçues
  const validateResponseData = (data, url) => {
    // Liste des validations spécifiques par endpoint
    const validations = {
      '/users': (data) => {
        // Si c'est déjà un tableau, c'est bon
        if (Array.isArray(data)) return true;

        // Si c'est un objet, on essaie d'extraire les données
        if (data && typeof data === 'object') {
          // Vérifie si c'est un objet avec une propriété data qui est un tableau
          if (data.data && Array.isArray(data.data)) return true;

          // Vérifie si c'est un objet avec des propriétés qui sont des objets utilisateur
          const values = Object.values(data);
          if (values.length > 0 && typeof values[0] === 'object' && values[0].id !== undefined) {
            return true;
          }

          // Vérifie si c'est un objet avec une propriété users qui est un tableau
          if (data.users && Array.isArray(data.users)) return true;
        }

        // Si on arrive ici, le format n'est pas reconnu
        console.warn('[API Validation] Format de réponse inattendu pour /users. Données reçues:', data);
        return false;
      },
      '/permissions': (data) => {
        if (!data || typeof data !== 'object') {
          console.warn('[API Validation] La réponse de /permissions est invalide');
          return false;
        }
        return true;
      }
      // Ajoutez d'autres validations spécifiques ici
    };

    // Trouver la validation appropriée basée sur l'URL
    const validationKey = Object.keys(validations).find(key => url.includes(key));
    if (validationKey) {
      return validations[validationKey](data);
    }

    return true;
  };

  // Fonction pour normaliser les données de réponse
  const normalizeResponseData = (data, url) => {
    if (!data) return data;

    // Normalisation spécifique pour /users
    if (url.includes('/users')) {
      // Si c'est déjà un tableau, on le retourne tel quel
      if (Array.isArray(data)) return data;

      // Si c'est un objet avec une propriété data qui est un tableau
      if (data.data && Array.isArray(data.data)) return data.data;

      // Si c'est un objet avec des propriétés qui sont des objets utilisateur
      const values = Object.values(data);
      if (values.length > 0 && typeof values[0] === 'object' && values[0].id !== undefined) {
        return values;
      }

      // Si c'est un objet avec une propriété users qui est un tableau
      if (data.users && Array.isArray(data.users)) return data.users;
    }

    // Pour les autres cas, retourner les données telles quelles
    return data;
  };

  // Intercepteur de réponse amélioré
  api.interceptors.response.use(
    (response) => {
      const { config, data, status, headers } = response;
      const { startTime, requestId } = config.metadata || {};
      const duration = startTime ? new Date() - startTime : 0;

      // Log détaillé des réponses
      const statusType = Math.floor(status / 100);
      const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'debug';

      if (logger.group(`← ${status} ${config.method?.toUpperCase()} ${config.url} (${duration}ms) [${requestId || '?'}]`, logLevel === 'debug')) {
        logger[logLevel]('Status:', status);
        if (logLevel !== 'debug' || logger.group('Headers', true)) {
          logger[logLevel]('Headers:', headers);
          logger.groupEnd()
        }
        logger[logLevel]('Data:', data)
        logger.groupEnd()
      }

      // Validation des données reçues
      try {
        // Validation basique de la structure
        if (!validateResponseData(data, config.url)) {
          // validationLogger.warn(`Données potentiellement incohérentes reçues de ${config.url}`)
        }

        // Vérification des incohérences avec les données précédentes
        const inconsistencies = checkDataConsistency(config.url, data)
        if (inconsistencies.hasInconsistencies) {
          /*
          if (validationLogger.group(`Incohérences détectées dans ${config.url}`)) {
            inconsistencies.details.forEach(detail => {
              validationLogger.warn(`${detail.type}: ${detail.message}`, detail)
            })
            validationLogger.groupEnd()
          }
          */
        }

        // Validation contre les schémas connus
        // Désactivé temporairement pour éviter les faux positifs durant la migration de format
        /*
        if (config.url.includes('/users')) {
          const schemaErrors = validateAgainstSchema(SCHEMAS.USER, Array.isArray(data) ? data[0] : data)
          if (schemaErrors.length > 0) {
            validationLogger.warn('Schéma utilisateur non respecté:', schemaErrors)
          }
        } else if (config.url.includes('/permissions')) {
          const schemaErrors = validateAgainstSchema(SCHEMAS.PERMISSION, Array.isArray(data) ? data[0] : data)
          if (schemaErrors.length > 0) {
            validationLogger.warn('Schéma de permission non respecté:', schemaErrors)
          }
        }
        */
      } catch (e) {
        validationLogger.error('Erreur lors de la validation des données:', e)
      }

      return response
    },
    (error) => {
      // Gestion centralisée des erreurs
      const { response, config } = error
      const { requestId } = config?.metadata || {}

      // Erreur réseau (pas de réponse du serveur)
      if (!response) {
        logger.error(`Erreur réseau - Le serveur est inaccessible [${requestId || '?'}]`)
        logger.debug('Détails de la requête:', {
          url: config?.url,
          method: config?.method,
          data: config?.data,
          headers: config?.headers
        })
        error.userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        return Promise.reject(error)
      }

      const { status, data } = response

      // 401 Unauthorized - Session expirée ou non authentifié
      if (status === 401) {
        logger.warn(`Session expirée ou non authentifié [${requestId || '?'}]`)
        logger.debug('Détails de la requête:', {
          url: config?.url,
          method: config?.method,
          headers: config?.headers
        })
        // Nettoyer la session locale
        const user = localStorage.getItem('user')
        if (user) {
          localStorage.removeItem('user')
          // Rediriger vers login seulement si on n'est pas déjà sur la page de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true'
          }
        }
        error.userMessage = data?.message || 'Votre session a expiré. Veuillez vous reconnecter.'
        return Promise.reject(error)
      }

      // 403 Forbidden - Accès refusé
      if (status === 403) {
        logger.warn('Accès refusé', { url: config?.url, method: config?.method })
        error.userMessage = data?.message || data?.reason || 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
        error.isForbidden = true
        return Promise.reject(error)
      }

      // 404 Not Found
      if (status === 404) {
        error.userMessage = data?.message || 'Ressource non trouvée.'
        return Promise.reject(error)
      }

      // 500+ Erreur serveur
      if (status >= 500) {
        logger.error(`Erreur serveur (${status}):`, data, { url: config?.url })
        error.userMessage = data?.message || 'Erreur serveur. Veuillez réessayer plus tard.'
        return Promise.reject(error)
      }

      // Autres erreurs (400, 422, etc.)
      error.userMessage = data?.message || data?.error || 'Une erreur est survenue.'
      return Promise.reject(error)
    }
  )

  // Pas besoin d'intercepteur pour X-User-Id
  // Le backend lit automatiquement req.session.userId depuis les cookies
}

export default api

