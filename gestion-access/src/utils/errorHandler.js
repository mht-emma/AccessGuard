/**
 * Utilitaire pour extraire les messages d'erreur de manière cohérente
 * Utilise les messages de l'intercepteur Axios si disponibles
 */
export const getErrorMessage = (error, defaultMessage = 'Une erreur est survenue') => {
  // Priorité 1: Message utilisateur de l'intercepteur Axios
  if (error.userMessage) {
    return error.userMessage
  }
  
  // Priorité 2: Message du backend
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Priorité 3: Erreur du backend (format alternatif)
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  // Priorité 4: Message d'erreur standard
  if (error.message) {
    return error.message
  }
  
  // Par défaut
  return defaultMessage
}

/**
 * Vérifie si l'erreur est une erreur d'accès refusé
 */
export const isForbiddenError = (error) => {
  return error.isForbidden || error.response?.status === 403
}

/**
 * Vérifie si l'erreur est une erreur d'authentification
 */
export const isUnauthorizedError = (error) => {
  return error.response?.status === 401
}

