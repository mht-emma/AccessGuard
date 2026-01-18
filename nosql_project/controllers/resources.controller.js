const { runRead, runWrite } = require('../services/neo4j.service');
const crypto = require('crypto');

/**
 * GET /resources
 * Liste toutes les ressources protégées
 */
async function getAllResources(req, res, next) {
  try {
    const cypher = `
      MATCH (r:Resource)
      OPTIONAL MATCH (p:Permission)-[:ACCESS_TO]->(r)
      RETURN r.id AS id, id(r) AS internalId, r.path AS path, r.description AS description, p
      ORDER BY r.path
    `;

    const result = await runRead(cypher);
    const resources = result.records.map((record) => {
      const p = record.get('p');
      const id = record.get('id');
      const internalId = record.get('internalId');

      return {
        id: id || internalId.toString(),
        path: record.get('path'),
        description: record.get('description'),
        permission: p ? { id: p.identity.toString(), name: p.properties.name } : null
      };
    });

    res.json({ resources });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /resources
 * Crée une nouvelle ressource
 * Body: { path (ex: /dashboard, /admin), description?, permissionId? }
 */
async function createResource(req, res, next) {
  try {
    const { path, description, permissionId } = req.body;

    if (!path) {
      return res.status(400).json({ message: 'Chemin de la ressource requis' });
    }

    const resourceId = crypto.randomUUID();

    let cypher = `
      CREATE (r:Resource {
        id: $resourceId,
        path: $path,
        description: $description,
        createdAt: datetime()
      })
    `;

    const params = {
      resourceId,
      path,
      description: description || null,
    };

    // Si une permission est liée
    if (permissionId) {
      cypher += `
        WITH r
        MATCH (p:Permission) WHERE id(p) = toInteger($permissionId)
        MERGE (p)-[:ACCESS_TO]->(r)
      `;
      params.permissionId = permissionId;
    }

    cypher += ' RETURN r';

    await runWrite(cypher, params);

    res.status(201).json({
      message: 'Ressource créée',
      resource: { id: resourceId, path, description },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /resources/:id
 * Met à jour une ressource
 * Body: { path, description?, permissionId? }
 */
async function updateResource(req, res, next) {
  try {
    const { id } = req.params;
    const { path, description, permissionId } = req.body;

    const numericId = !isNaN(id) ? id : "-1";

    // 1. Mise à jour des infos de base
    const updateCypher = `
      MATCH (r:Resource)
      WHERE r.id = $id OR id(r) = toInteger($numericId)
      SET r.path = COALESCE($path, r.path),
          r.description = $description,
          r.updatedAt = datetime()
      RETURN r
    `;

    const result = await runWrite(updateCypher, {
      id,
      numericId,
      path,
      description: description || null
    });

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Ressource non trouvée' });
    }

    // 2. Mise à jour de la permission liée
    if (permissionId !== undefined) {
      // Supprimer l'ancienne relation
      await runWrite(
        `MATCH (p:Permission)-[rel:ACCESS_TO]->(r:Resource)
         WHERE r.id = $id OR id(r) = toInteger($numericId)
         DELETE rel`,
        { id, numericId }
      );

      if (permissionId) {
        await runWrite(
          `
          MATCH (r:Resource)
          WHERE r.id = $id OR id(r) = toInteger($numericId)
          MATCH (p:Permission) WHERE id(p) = toInteger($permissionId)
          MERGE (p)-[:ACCESS_TO]->(r)
          `,
          { id, numericId, permissionId }
        );
      }
    }

    res.json({ message: 'Ressource mise à jour' });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /resources/:id
 * Supprime une ressource
 */
async function deleteResource(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = !isNaN(id) ? id : "-1";

    await runWrite(
      `MATCH (r:Resource)
       WHERE r.id = $id OR id(r) = toInteger($numericId)
       DETACH DELETE r`,
      { id, numericId }
    );

    res.json({ message: 'Ressource supprimée' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
};