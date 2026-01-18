const { runRead, runWrite } = require('../services/neo4j.service');

/**
 * GET /permissions
 * Liste toutes les permissions (format: READ_DASHBOARD, WRITE_USERS, etc.)
 */
async function getAllPermissions(req, res, next) {
  try {
    const cypher = `
      MATCH (p:Permission)
      RETURN p
      ORDER BY p.name
    `;

    const result = await runRead(cypher);
    const permissions = result.records.map((record) => {
      const p = record.get('p');
      return {
        id: p.identity.toString(),
        ...p.properties
      };
    });

    res.json({ permissions });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /permissions
 * Crée une nouvelle permission
 * Body: { name (ex: "READ_REPORTS", "WRITE_SETTINGS"), description }
 */
async function createPermission(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nom de la permission requis (ex: READ_DASHBOARD)' });
    }

    // Vérifier le format (doit être ACTION_RESOURCE)
    if (!name.match(/^(READ|WRITE|DELETE|EDIT)_[A-Z_]+$/)) {
      return res.status(400).json({
        message: 'Format invalide. Attendu: ACTION_RESOURCE (ex: READ_DASHBOARD, WRITE_USERS)'
      });
    }

    const cypher = `
      MERGE (p:Permission {name: $name})
      ON CREATE SET p.description = $description, p.createdAt = datetime()
      ON MATCH SET p.description = $description, p.updatedAt = datetime()
      RETURN p
    `;

    const result = await runWrite(cypher, { name, description: description || null });
    const p = result.records[0].get('p');

    res.status(201).json({
      message: 'Permission créée',
      permission: {
        id: p.identity.toString(),
        ...p.properties
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /permissions/:id
 * Met à jour une permission
 */
async function updatePermission(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Vérifier le format si le nom est changé
    if (name && !name.match(/^(READ|WRITE|DELETE|EDIT)_[A-Z_]+$/)) {
      return res.status(400).json({
        message: 'Format invalide. Attendu: ACTION_RESOURCE (ex: READ_DASHBOARD, WRITE_USERS)'
      });
    }

    const cypher = `
      MATCH (p:Permission) WHERE id(p) = toInteger($id)
      SET p.name = COALESCE($name, p.name),
          p.description = $description,
          p.updatedAt = datetime()
      RETURN p
    `;

    const result = await runWrite(cypher, { id, name, description: description || null });

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Permission non trouvée' });
    }

    const p = result.records[0].get('p');
    res.json({
      id: p.identity.toString(),
      ...p.properties
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /permissions/:id
 * Supprime une permission
 */
async function deletePermission(req, res, next) {
  try {
    const { id } = req.params;

    const cypher = `
      MATCH (p:Permission) WHERE id(p) = toInteger($id)
      DETACH DELETE p
    `;

    await runWrite(cypher, { id });

    res.json({ message: 'Permission supprimée' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /permissions/:name/resource
 * Associe une permission à une ressource
 * Body: { resourcePath (ex: "/dashboard") }
 */
async function assignPermissionToResource(req, res, next) {
  try {
    const { name } = req.params;
    const { resourcePath } = req.body;

    if (!resourcePath) {
      return res.status(400).json({ message: 'resourcePath requis' });
    }

    const cypher = `
      MATCH (p:Permission {name: $name})
      MATCH (r:Resource {path: $resourcePath})
      MERGE (p)-[:ACCESS_TO]->(r)
      RETURN p, r
    `;

    const result = await runWrite(cypher, { name, resourcePath });

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Permission ou Ressource non trouvée' });
    }

    res.json({ message: 'Permission associée à la ressource' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToResource,
};