const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

// GET /stats/summary
router.get('/summary', statsController.getSystemSummary);

// GET /stats/activity
router.get('/activity', statsController.getRecentActivity);

module.exports = router;
