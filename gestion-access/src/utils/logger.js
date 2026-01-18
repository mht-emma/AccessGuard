/**
 * Utilitaire de journalisation centralisé
 * Niveaux de log : error, warn, info, debug, trace
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
}

const LOG_LEVEL = (() => {
  // En production, seul error est affiché par défaut
  if (import.meta.env.PROD) return LOG_LEVELS.error
  
  // En développement, on peut surcharger avec VITE_LOG_LEVEL
  const level = import.meta.env.VITE_LOG_LEVEL?.toLowerCase() || 'debug'
  return LOG_LEVELS[level] ?? LOG_LEVELS.debug
})()

const shouldLog = (level) => {
  return LOG_LEVEL >= (LOG_LEVELS[level] || 0)
}

export const logger = {
  error: (message, ...args) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  },
  
  warn: (message, ...args) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  
  info: (message, ...args) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  debug: (message, ...args) => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  
  trace: (message, ...args) => {
    if (shouldLog('trace')) {
      console.trace(`[TRACE] ${message}`, ...args)
    }
  },
  
  group: (label, collapsed = true) => {
    if (shouldLog('debug')) {
      if (collapsed) {
        console.groupCollapsed(label)
      } else {
        console.group(label)
      }
      return true
    }
    return false
  },
  
  groupEnd: () => {
    if (shouldLog('debug')) {
      console.groupEnd()
    }
  }
}

// Pour une utilisation avec des tags (ex: [API], [AUTH], etc.)
export const createLogger = (tag) => ({
  error: (message, ...args) => logger.error(`[${tag}] ${message}`, ...args),
  warn: (message, ...args) => logger.warn(`[${tag}] ${message}`, ...args),
  info: (message, ...args) => logger.info(`[${tag}] ${message}`, ...args),
  debug: (message, ...args) => logger.debug(`[${tag}] ${message}`, ...args),
  trace: (message, ...args) => logger.trace(`[${tag}] ${message}`, ...args),
  group: (label, collapsed = true) => logger.group(`[${tag}] ${label}`, collapsed),
  groupEnd: () => logger.groupEnd()
})

// Export du logger par défaut
export default logger
