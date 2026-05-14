const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');

// 1. Clones the repo
router.post('/init', deploymentController.initDeploy);

// 2. Saves the .env and Dockerfile
router.post('/save-files', deploymentController.saveDeploymentFiles);

// 3. THIS WAS MISSING: Starts the socket stream build engine!
router.post('/start-build', deploymentController.startBuild);

module.exports = router;