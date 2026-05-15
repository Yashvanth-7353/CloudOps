const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');

// 1. Clones the repo
router.post('/init', deploymentController.initDeploy);

// 2. Saves the .env and Dockerfile
router.post('/save-files', deploymentController.saveDeploymentFiles);

// 3. Starts the real deployment engine
router.post('/start', deploymentController.startBuild);
router.post('/start-build', deploymentController.startBuild);

// 4. AWS EC2 Deployment
router.post('/aws-ec2', deploymentController.startAWSEC2Deployment);

// 5. Deployment lifecycle APIs
router.get('/:deploymentId/status', deploymentController.getDeploymentStatus);
router.get('/:deploymentId/logs', deploymentController.getDeploymentLogs);
router.get('/:deploymentId/service-logs', deploymentController.getDeploymentServiceLogs);
router.post('/:deploymentId/stop', deploymentController.stopDeployment);
router.post('/:deploymentId/restart', deploymentController.restartDeployment);

module.exports = router;