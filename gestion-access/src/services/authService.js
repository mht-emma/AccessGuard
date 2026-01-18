import api from './api';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthService');

// Cache pour les permissions vérifiées
const permissionCache = new Map();

/**
 * Vérifie si l'utilisateur actuel a une permission spécifique
 * @param {string} permission - La permission à vérifier
 * @returns {Promise<boolean>} - True si l'utilisateur a la permission
 */
export const checkPermission = async (permission) => {
  if (!permission) {
    logger.warn('Aucune permission spécifiée pour la vérification');
    return false;
  }

  // Vérifier le cache d'abord
  const cached = permissionCache.get(permission);
  if (cached !== undefined) {
    logger.debug(`Permission ${permission} récupérée depuis le cache:`, cached);
    return cached;
  }

  try {
    logger.debug(`Vérification de la permission: ${permission}`);
    const response = await api.post('/auth/check-permission', { permission });
    const hasPermission = response.data?.hasPermission === true;
    
    // Mettre en cache pour 5 minutes
    permissionCache.set(permission, hasPermission);
    setTimeout(() => {
      logger.debug(`Suppression de la permission ${permission} du cache`);
      permissionCache.delete(permission);
    }, 5 * 60 * 1000);
    
    return hasPermission;
  } catch (error) {
    logger.error('Erreur lors de la vérification de la permission:', {
      permission,
      error: error.response?.data || error.message
    });
    
    // En cas d'erreur 401 (non authentifié), on laisse remonter pour gérer la déconnexion
    if (error.response?.status === 401) {
      throw error;
    }
    
    // Pour les autres erreurs, on refuse par sécurité
    return false;
  }
};

/**
 * Vérifie l'état d'authentification de l'utilisateur
 * @returns {Promise<Object|null>} Les données de l'utilisateur ou null si non authentifié
 */
export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

/**
 * Efface le cache des permissions
 * Utile après une déconnexion ou un changement de rôle
 */
export const clearPermissionCache = () => {
  permissionCache.clear();
  logger.debug('Cache des permissions vidé');
};
