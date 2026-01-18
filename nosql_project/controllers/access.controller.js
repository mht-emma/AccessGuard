const neo4j = require('neo4j-driver');
const { runRead } = require('../services/neo4j.service');
const logger = console;

/**
 * GET /access/attempts
 * Récupère les tentatives d'accès avec filtrage avancé
 * Query params:
 * - userId: Filtre par utilisateur
 * - status: Filtre par statut (AUTHORIZED, DENIED, etc.)
 * - ip: Filtre par adresse IP
 * - limit: Limite le nombre de résultats (défaut: 100)
 * - offset: Pagination (défaut: 0)
 */
async function getAccessAttempts(req, res, next) {
  const startTime = process.hrtime();
  const {
    userId,
    status,
    ip,
    resource,
    limit = 100,
    offset = 0
  } = req.query;

  try {
    const parsedLimit = Math.min(parseInt(limit, 10), 1000) || 100;
    const parsedOffset = Math.max(0, parseInt(offset, 10)) || 0;

    let cypher = `
      MATCH (attempt:AccessAttempt)
    `;

    const params = {
      limit: neo4j.int(parsedLimit),
      skip: neo4j.int(parsedOffset)
    };

    const filters = [];

    // Filter by User
    if (userId) {
      cypher += ` OPTIONAL MATCH (u:User)-[:TRIED_TO_ACCESS]->(attempt) `;
      filters.push(`u.id = $userId`);
      params.userId = userId;
    } else {
      // Always try to match user for display
      cypher += ` OPTIONAL MATCH (u:User)-[:TRIED_TO_ACCESS]->(attempt) `;
    }

    // Filter by Status
    if (status) {
      filters.push(`attempt.status = $status`);
      params.status = status;
    }

    // Filter by IP (Linked node or string property? Assuming Relation based on existing code)
    if (ip) {
      cypher += ` OPTIONAL MATCH (attempt)-[:FROM_IP]->(ipNode:IP) `;
      filters.push(`ipNode.address = $ip`);
      params.ip = ip;
    } else {
      cypher += ` OPTIONAL MATCH (attempt)-[:FROM_IP]->(ipNode:IP) `;
    }

    // Filter by Resource Path
    if (resource) {
      cypher += ` OPTIONAL MATCH (attempt)-[:TARGET]->(r:Resource) `;
      filters.push(`r.path CONTAINS $resource`);
      params.resource = resource;
    } else {
      cypher += ` OPTIONAL MATCH (attempt)-[:TARGET]->(r:Resource) `;
    }

    if (filters.length > 0) {
      cypher += ` WHERE ${filters.join(' AND ')} `;
    }

    cypher += `
      RETURN DISTINCT
        attempt.id AS id,
        attempt.timestamp AS timestamp,
        attempt.status AS status,
        attempt.reason AS reason,
        u.username AS username,
        u.id AS userId,
        r.path AS resourcePath,
        ipNode.address AS ipAddress
      ORDER BY attempt.timestamp DESC
      SKIP $skip
      LIMIT $limit
    `;

    const result = await runRead(cypher, params);

    // Construction of count query to match the main query filters
    let countCypher = `MATCH (attempt:AccessAttempt) `;

    // We need to re-apply the same MATCH patterns for the filters to work (because filters use u.id, r.path, etc)

    if (userId) {
      countCypher += `MATCH (u:User)-[:TRIED_TO_ACCESS]->(attempt) `;
    } else {
      // If filter is NOT user, we don't strictly need to MATCH user for the count, 
      // UNLESS we want to be consistent with main query being INNER JOIN-like for filters?
      // Actually, the main query used OPTIONAL MATCH.
      // But if we used WHERE u.id = ..., it effectively became a MATCH.
      // So for count, if we have a filter on u, needs MATCH. 
      // If no filter on u, we don't need to MATCH u for the count of attempts.
    }

    if (ip) {
      countCypher += `MATCH (attempt)-[:FROM_IP]->(ipNode:IP) `;
    }

    if (resource) {
      countCypher += `MATCH (attempt)-[:TARGET]->(r:Resource) `;
    }

    // Status is on the attempt itself, no extra match needed.

    if (filters.length > 0) {
      countCypher += ` WHERE ${filters.join(' AND ')} `;
    }

    countCypher += ` RETURN count(DISTINCT attempt.id) AS total`;

    const countResult = await runRead(countCypher, params);
    const total = countResult.records[0]?.get('total').toNumber() || 0;

    logger.debug('Fetching access attempts with filters', {
      userId, status, ip, resource, limit: parsedLimit, offset: parsedOffset
    });

    // ... [Original filter logic code] ... 

    const attempts = result.records.map((record) => {
      const timestampVal = record.get('timestamp');
      let formattedTimestamp = timestampVal;

      // Neo4j DateTime handling
      if (neo4j.isDateTime(timestampVal) || neo4j.isDate(timestampVal) || neo4j.isLocalDateTime(timestampVal)) {
        formattedTimestamp = timestampVal.toString();
      }

      return {
        id: record.get('id'),
        timestamp: formattedTimestamp,
        status: record.get('status'),
        reason: record.get('reason'),
        user: record.get('username') ? { username: record.get('username'), id: record.get('userId') } : null,
        resource: record.get('resourcePath') ? { path: record.get('resourcePath') } : null,
        ip: record.get('ipAddress') ? { address: record.get('ipAddress') } : null
      };
    });

    const [seconds, ns] = process.hrtime(startTime);
    const responseTime = (seconds * 1000 + ns / 1e6).toFixed(2);

    res.json({
      success: true,
      data: attempts,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: (parsedOffset + attempts.length) < total
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des tentatives d\'accès', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
}

/**
 * GET /access/decision
 * Récupère la décision d'accès pour la requête courante
 */
async function getAccessDecision(req, res) {
  const { accessDecision } = req;

  if (!accessDecision) {
    logger.warn('Tentative d\'accès à la décision sans middleware accessControl', {
      path: req.path,
      method: req.method,
      sessionId: req.sessionID
    });

    return res.status(500).json({
      success: false,
      code: 'MISSING_ACCESS_DECISION',
      message: 'La décision d\'accès n\'est pas disponible'
    });
  }

  logger.debug('Récupération de la décision d\'accès', {
    decision: accessDecision,
    userId: req.session?.user?.userId,
    path: req.path
  });

  res.json({
    success: true,
    data: accessDecision
  });
}

/**
 * POST /access/check-permission
 * Vérifie si l'utilisateur a une permission spécifique
 * Body: { permission: string }
 */
async function checkPermission(req, res, next) {
  const { permission: permissionName } = req.body;
  const { username } = req.user;

  if (!permissionName) {
    return res.status(400).json({
      error: 'Le paramètre "permission" est requis'
    });
  }

  try {
    const cypher = `
      MATCH (u:User {username: $username})-[:HAS_ROLE]->(r:Role)
            -[:GRANTS]->(p:Permission {name: $permissionName})
      RETURN COUNT(p) > 0 AS hasPermission
    `;

    const result = await runRead(cypher, { username, permissionName });
    const hasPermission = result.records[0]?.get('hasPermission') || false;

    res.json({
      hasPermission,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification de la permission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getAccessAttempts,
  getAccessDecision,
  checkPermission
};