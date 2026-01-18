const { runRead } = require('../services/neo4j.service');

/**
 * GET /stats/summary
 * Récupère les compteurs globaux du système pour le tableau de bord
 */
async function getSystemSummary(req, res, next) {
    try {
        const cypher = `
      MATCH (u:User)
      WITH count(u) AS userCount
      MATCH (r:Role)
      WITH userCount, count(r) AS roleCount
      MATCH (res:Resource)
      WITH userCount, roleCount, count(res) AS resourceCount
      
      OPTIONAL MATCH (a:AccessAttempt)
      WHERE a.timestamp >= datetime() - duration({days: 1})
      WITH userCount, roleCount, resourceCount, count(a) AS recentAttempts
      
      OPTIONAL MATCH (f:AccessAttempt)
      WHERE f.status = 'DENIED' AND f.timestamp >= datetime() - duration({days: 1})
      WITH userCount, roleCount, resourceCount, recentAttempts, count(f) AS currentFailed
      
      OPTIONAL MATCH (tf:AccessAttempt {status: 'DENIED'})
      RETURN userCount, roleCount, resourceCount, recentAttempts, currentFailed, count(tf) AS totalFailed
    `;

        const result = await runRead(cypher);
        const record = result.records[0];

        const summary = {
            users: record.get('userCount').toNumber(),
            roles: record.get('roleCount').toNumber(),
            resources: record.get('resourceCount').toNumber(),
            recentActivity: record.get('recentAttempts').toNumber(),
            failedAttempts: record.get('currentFailed').toNumber(),
            totalFailed: record.get('totalFailed').toNumber(),
            lastUpdate: new Date()
        };

        res.json(summary);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /stats/activity
 * Récupère les 10 dernières activités réelles
 */
async function getRecentActivity(req, res, next) {
    try {
        const cypher = `
      MATCH (a:AccessAttempt)
      OPTIONAL MATCH (u:User)-[:TRIED_TO_ACCESS]->(a)
      OPTIONAL MATCH (a)-[:TARGET]->(res:Resource)
      RETURN 
        a.id AS id, 
        toString(a.timestamp) AS timestamp, 
        a.status AS status, 
        a.ip AS ip,
        u.username AS username,
        res.path AS resourcePath
      ORDER BY a.timestamp DESC
      LIMIT 10
    `;

        const result = await runRead(cypher);
        const activity = result.records.map(record => ({
            id: record.get('id'),
            timestamp: record.get('timestamp'),
            status: record.get('status'),
            ip: record.get('ip'),
            username: record.get('username') || 'Anonyme',
            resourcePath: record.get('resourcePath') || 'Inconnu'
        }));

        res.json(activity);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getSystemSummary,
    getRecentActivity
};
