import { createLogger } from './logger'

const logger = createLogger('DATA_CONSISTENCY')

/**
 * Utilitaire pour détecter les incohérences entre le frontend et le backend
 */

// Cache pour stocker l'état précédent des données
const dataCache = new Map()

/**
 * Vérifie les incohérences entre les données reçues et le cache
 * @param {string} endpoint - L'endpoint de l'API
 * @param {*} newData - Les nouvelles données reçues
 * @returns {Object} - Un objet contenant les incohérences détectées
 */
export const checkDataConsistency = (endpoint, newData) => {
  const previousData = dataCache.get(endpoint)
  const inconsistencies = {
    hasInconsistencies: false,
    details: []
  }

  // Si c'est la première fois qu'on reçoit des données pour cet endpoint
  if (!previousData) {
    dataCache.set(endpoint, {
      data: newData,
      lastUpdated: new Date(),
      count: Array.isArray(newData) ? newData.length : 1
    })
    return inconsistencies
  }

  // Vérifier les incohérences de type
  if (Array.isArray(previousData.data) !== Array.isArray(newData)) {
    inconsistencies.hasInconsistencies = true
    inconsistencies.details.push({
      type: 'TYPE_MISMATCH',
      message: `Le type de données a changé pour ${endpoint}`,
      previous: Array.isArray(previousData.data) ? 'array' : typeof previousData.data,
      current: Array.isArray(newData) ? 'array' : typeof newData
    })
  }

  // Vérifier les incohérences de taille pour les tableaux
  if (Array.isArray(previousData.data) && Array.isArray(newData)) {
    if (previousData.data.length !== newData.length) {
      inconsistencies.hasInconsistencies = true
      inconsistencies.details.push({
        type: 'SIZE_MISMATCH',
        message: `Le nombre d'éléments a changé pour ${endpoint}`,
        previous: previousData.data.length,
        current: newData.length
      })
    }

    // Vérifier les IDs manquants ou ajoutés
    const previousIds = previousData.data.map(item => item?.id).filter(Boolean)
    const newIds = newData.map(item => item?.id).filter(Boolean)
    
    const missingIds = previousIds.filter(id => !newIds.includes(id))
    const addedIds = newIds.filter(id => !previousIds.includes(id))

    if (missingIds.length > 0) {
      inconsistencies.hasInconsistencies = true
      inconsistencies.details.push({
        type: 'MISSING_ITEMS',
        message: `Des éléments ont disparu de ${endpoint}`,
        count: missingIds.length,
        ids: missingIds
      })
    }

    if (addedIds.length > 0) {
      inconsistencies.hasInconsistencies = true
      inconsistencies.details.push({
        type: 'ADDED_ITEMS',
        message: `De nouveaux éléments sont apparus dans ${endpoint}`,
        count: addedIds.length,
        ids: addedIds
      })
    }
  }

  // Mettre à jour le cache
  dataCache.set(endpoint, {
    data: newData,
    lastUpdated: new Date(),
    count: Array.isArray(newData) ? newData.length : 1
  })

  return inconsistencies
}

/**
 * Nettoie le cache pour un endpoint spécifique ou pour tous les endpoints
 * @param {string} [endpoint] - L'endpoint à nettoyer (optionnel)
 */
export const clearConsistencyCache = (endpoint) => {
  if (endpoint) {
    dataCache.delete(endpoint)
  } else {
    dataCache.clear()
  }
}

/**
 * Vérifie si les données sont cohérentes avec le schéma attendu
 * @param {Object} schema - Le schéma attendu
 * @param {*} data - Les données à valider
 * @returns {Array} - Liste des erreurs de validation
 */
export const validateAgainstSchema = (schema, data) => {
  const errors = []
  
  if (!schema || !data || typeof data !== 'object') {
    logger.warn('La réponse est invalide')
    return false
  }

  // Implémentation basique de validation de schéma
  const validateObject = (schema, data, path = '') => {
    if (typeof schema !== 'object' || schema === null) {
      return
    }

    for (const [key, expectedType] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key
      const value = data[key]
      
      if (value === undefined) {
        const error = `Champ manquant: ${currentPath}`
        logger.debug(error)
        errors.push(error)
        continue
      }

      if (expectedType === 'array') {
        if (!Array.isArray(value)) {
          const error = `Le champ ${currentPath} devrait être un tableau`
          logger.debug(error)
          errors.push(error)
        }
      } else if (typeof expectedType === 'string') {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== expectedType) {
          const error = `Type incorrect pour ${currentPath}: attendu ${expectedType}, reçu ${actualType}`
          logger.debug(error)
          errors.push(error)
        }
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        if (typeof value !== 'object' || value === null) {
          const error = `Le champ ${currentPath} devrait être un objet`
          logger.debug(error)
          errors.push(error)
        } else {
          validateObject(expectedType, value, currentPath)
        }
      }
    }
  }

  validateObject(schema, data)
  return errors
}

// Schémas de validation pour les endpoints courants
export const SCHEMAS = {
  USER: {
    id: 'string',
    username: 'string',
    email: 'string',
    role: 'string',
    permissions: 'array',
    isActive: 'boolean',
    lastLogin: 'string',
    createdAt: 'string',
    updatedAt: 'string'
  },
  PERMISSION: {
    id: 'string',
    name: 'string',
    description: 'string',
    resource: 'string',
    action: 'string',
    createdAt: 'string',
    updatedAt: 'string'
  }
}
