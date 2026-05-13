/**
 * Deployment Routes
 * API endpoints for deployment operations
 */

const express = require('express');
const deploymentController = require('../controllers/deploymentController');
const authMiddleware = require('../middleware/authMiddleware');
const deploymentValidator = require('../validators/deploymentValidator');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Start new deployment
 * POST /api/deploy/start
 */
router.post('/start', deploymentValidator.validateStartDeployment, async (req, res) => {
  await deploymentController.startDeployment(req, res);
});

/**
 * Get deployment status
 * GET /api/deploy/:deploymentId
 */
router.get('/:deploymentId', async (req, res) => {
  await deploymentController.getDeploymentStatus(req, res);
});

/**
 * Get deployment logs
 * GET /api/deploy/:deploymentId/logs
 */
router.get('/:deploymentId/logs', async (req, res) => {
  await deploymentController.getDeploymentLogs(req, res);
});

/**
 * Get deployment metrics
 * GET /api/deploy/:deploymentId/metrics
 */
router.get('/:deploymentId/metrics', async (req, res) => {
  await deploymentController.getDeploymentMetrics(req, res);
});

/**
 * Get deployment dockerfile
 * GET /api/deploy/:deploymentId/dockerfile
 */
router.get('/:deploymentId/dockerfile', async (req, res) => {
  await deploymentController.getDockerfile(req, res);
});

/**
 * Cancel deployment
 * POST /api/deploy/:deploymentId/cancel
 */
router.post('/:deploymentId/cancel', async (req, res) => {
  await deploymentController.cancelDeployment(req, res);
});

/**
 * Retry deployment
 * POST /api/deploy/:deploymentId/retry
 */
router.post('/:deploymentId/retry', async (req, res) => {
  await deploymentController.retryDeployment(req, res);
});

/**
 * List project deployments
 * GET /api/projects/:projectId/deployments
 */
router.get('/projects/:projectId/deployments', async (req, res) => {
  await deploymentController.listDeployments(req, res);
});

/**
 * Get project deployment statistics
 * GET /api/projects/:projectId/deployment-stats
 */
router.get('/projects/:projectId/deployment-stats', async (req, res) => {
  await deploymentController.getDeploymentStats(req, res);
});

module.exports = router;
