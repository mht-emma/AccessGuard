const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resources.controller');

/**
 * Routes protégées pour la gestion des ressources
 * Le middleware accessControl vérifie automatiquement les permissions
 */

// GET /resources - Nécessite permission READ sur /resources
router.get('/', resourcesController.getAllResources);

// POST /resources - Nécessite permission WRITE sur /resources
router.post('/', resourcesController.createResource);

// PUT /resources/:id
router.put('/:id', resourcesController.updateResource);

// DELETE /resources/:id
router.delete('/:id', resourcesController.deleteResource);

module.exports = router;