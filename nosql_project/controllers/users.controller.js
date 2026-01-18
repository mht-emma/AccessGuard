const { runRead, runWrite } = require('../services/neo4j.service');
const crypto = require('crypto');

/**
 * GET /users
 * Liste tous les utilisateurs avec leurs rôles
 */
async function getAllUsers(req, res, next) {
  try {
    const cypher = `
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
      RETURN u.id AS id, u.username AS username, u.email AS email, 
             r.name AS roleName, id(r) AS roleId
      ORDER BY u.username
    `;

    const result = await runRead(cypher);
    const users = result.records.map((record) => {
      const roleName = record.get('roleName');
      const roleId = record.get('roleId');

      return {
        id: record.get('id'),
        username: record.get('username'),
        email: record.get('email'),
        role: roleName ? {
          id: roleId.toString(),
          name: roleName
        } : null,
      };
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /users
 * Crée un nouvel utilisateur
 * Body: { username, email?, roleId? }
 */
async function createUser(req, res, next) {
  try {
    const { username, email, roleId, roleName } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username requis' });
    }

    const userId = crypto.randomUUID();

    let cypher = `
      CREATE (u:User {
        id: $userId,
        username: $username,
        email: $email,
        createdAt: datetime()
      })
    `;

    const params = { userId, username, email: email || null };

    // Si un rôle est spécifié (roleId prioritaire)
    if (roleId) {
      cypher += `
        WITH u
        MATCH (r:Role) WHERE id(r) = toInteger($roleId)
        MERGE (u)-[:HAS_ROLE]->(r)
      `;
      params.roleId = roleId;
    } else if (roleName) {
      cypher += `
        WITH u
        MATCH (r:Role {name: $roleName})
        MERGE (u)-[:HAS_ROLE]->(r)
      `;
      params.roleName = roleName;
    }

    cypher += ` RETURN u`;

    await runWrite(cypher, params);

    res.status(201).json({
      message: 'Utilisateur créé',
      user: { id: userId, username, email, roleId, roleName },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /users/:id
 * Met à jour un utilisateur
 * Body: { username?, email?, roleId? }
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email, roleId, roleName } = req.body;

    // Mise à jour des propriétés de base
    const cypher = `
      MATCH (u:User {id: $id})
      SET u.username = COALESCE($username, u.username),
          u.email = COALESCE($email, u.email),
          u.updatedAt = datetime()
      RETURN u
    `;

    const result = await runWrite(cypher, { id, username, email });

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Gestion de la mise à jour du rôle
    if (roleId || roleName) {
      // 1. Supprimer l'ancienne relation
      const deleteRelCypher = `
        MATCH (u:User {id: $id})
        OPTIONAL MATCH (u)-[oldRel:HAS_ROLE]->(:Role)
        DELETE oldRel
      `;
      await runWrite(deleteRelCypher, { id });

      // 2. Créer la nouvelle relation
      let createRelCypher = `MATCH (u:User {id: $id}) `;
      const relParams = { id };

      if (roleId) {
        createRelCypher += `MATCH (r:Role) WHERE id(r) = toInteger($roleId) MERGE (u)-[:HAS_ROLE]->(r)`;
        relParams.roleId = roleId;
      } else {
        createRelCypher += `MATCH (r:Role {name: $roleName}) MERGE (u)-[:HAS_ROLE]->(r)`;
        relParams.roleName = roleName;
      }

      await runWrite(createRelCypher, relParams);
    }

    res.json({ message: 'Utilisateur mis à jour' });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /users/:id
 * Supprime un utilisateur
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const cypher = `
      MATCH (u:User {id: $id})
      DETACH DELETE u
    `;

    await runWrite(cypher, { id });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};