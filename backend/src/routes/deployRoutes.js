const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');

// This is the exact URL GitHub is knocking on: /api/deploy/webhook
router.post('/deploy/webhook', deploymentController.handleWebhook);

module.exports = router;