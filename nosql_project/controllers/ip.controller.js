const { runRead, runWrite } = require('../services/neo4j.service');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /ips
 * Liste toutes les IP enregistrées avec les utilisateurs associés
 */
async function getAllIPs(req, res, next) {
  try {
    const cypher = `
      MATCH (ip:IP)
      OPTIONAL MATCH (u:User)-[:CONNECTS_FROM]->(ip)
      RETURN ip, u
      ORDER BY ip.address
    `;

    const result = await runRead(cypher);
    const ipsMap = new Map();

    result.records.forEach((record) => {
      const ipNode = record.get('ip');
      const userNode = record.get('u');
      const ipId = ipNode.properties.id || ipNode.identity.toString();

      if (!ipsMap.has(ipId)) {
        ipsMap.set(ipId, {
          id: ipId,
          ...ipNode.properties,
          users: []
        });
      }

      if (userNode) {
        ipsMap.get(ipId).users.push({
          id: userNode.properties.id || userNode.identity.toString(),
          username: userNode.properties.username
        });
      }
    });

    res.json(Array.from(ipsMap.values()));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ips
 * Enregistre une nouvelle IP
 * Body: { address, isSuspicious, userId }
 */
async function createIP(req, res, next) {
  try {
    const { address, isSuspicious, userId } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Adresse IP requise' });
    }

    const ipId = uuidv4();
    const cypher = `
      MERGE (ip:IP {address: $address})
      ON CREATE SET 
        ip.id = $id,
        ip.isSuspicious = $isSuspicious,
        ip.createdAt = datetime()
      ON MATCH SET
        ip.isSuspicious = $isSuspicious
      
      WITH ip
      OPTIONAL MATCH (u:User {id: $userId})
      WHERE $userId IS NOT NULL
      FOREACH (ignore IN CASE WHEN u IS NOT NULL THEN [1] ELSE [] END |
        MERGE (u)-[:CONNECTS_FROM]->(ip)
      )
      RETURN ip
    `;

    await runWrite(cypher, {
      address,
      id: ipId,
      isSuspicious: !!isSuspicious,
      userId: userId || null
    });

    res.status(201).json({
      message: 'IP enregistrée',
      ip: { address, id: ipId, isSuspicious }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /ips/:id
 * Met à jour une IP
 */
async function updateIP(req, res, next) {
  try {
    const { id } = req.params;
    const { address, isSuspicious, userId } = req.body;

    const cypher = `
      MATCH (ip:IP)
      WHERE ip.id = $id OR id(ip) = toInteger($numericId)
      SET 
        ip.address = $address,
        ip.isSuspicious = $isSuspicious
      
      // Supprimer les anciennes relations si on change d'utilisateur
      WITH ip
      OPTIONAL MATCH (oldU:User)-[r:CONNECTS_FROM]->(ip)
      DELETE r
      
      WITH ip
      OPTIONAL MATCH (u:User {id: $userId})
      WHERE $userId IS NOT NULL
      FOREACH (ignore IN CASE WHEN u IS NOT NULL THEN [1] ELSE [] END |
        MERGE (u)-[:CONNECTS_FROM]->(ip)
      )
      RETURN ip
    `;

    // Essayer de parser l'id comme un entier pour la compatibilité avec identity
    const numericId = !isNaN(id) ? id : "-1";

    await runWrite(cypher, {
      id,
      numericId,
      address,
      isSuspicious: !!isSuspicious,
      userId: userId || null
    });

    res.json({ message: 'IP mise à jour' });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /ips/:id
 */
async function deleteIP(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = !isNaN(id) ? id : "-1";

    const cypher = `
      MATCH (ip:IP)
      WHERE ip.id = $id OR id(ip) = toInteger($numericId)
      DETACH DELETE ip
    `;

    await runWrite(cypher, { id, numericId });
    res.json({ message: 'IP supprimée' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/ips
 * Récupère toutes les IP connues d'un utilisateur
 */
async function getUserIPs(req, res, next) {
  try {
    const { id } = req.params;

    const cypher = `
      MATCH (u:User {id: $userId})-[:CONNECTS_FROM]->(ip:IP)
      RETURN ip.address AS address, ip.isSuspicious AS isSuspicious
      ORDER BY ip.address
    `;

    const result = await runRead(cypher, { userId: id });
    const ips = result.records.map((record) => ({
      address: record.get('address'),
      isSuspicious: record.get('isSuspicious')
    }));

    res.json(ips);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllIPs,
  createIP,
  updateIP,
  deleteIP,
  getUserIPs,
};