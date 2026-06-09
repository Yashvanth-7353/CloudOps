const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');

// 1. Clones the repo and returns file tree
router.post('/init', deploymentController.initDeploy);

// 2. Detects framework for selected root directory
router.post('/detect', deploymentController.detectFramework);

// 3. Saves environment configuration
router.post('/save-files', deploymentController.saveDeploymentFiles);

// 4. Starts static build and deploy (streams logs via socket)
router.post('/start-build', deploymentController.startBuild);

module.exports = router;