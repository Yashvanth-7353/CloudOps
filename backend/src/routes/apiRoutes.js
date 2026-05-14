const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    healthCheck,
    listDeployments,
    createDeployment,
    getDeploymentById,
    getDeploymentLogs,
    getDeploymentStatus,
    getAnalyticsDashboard,
    getAnalyticsDeployments,
    getAnalyticsCosts,
    getAnalyticsPerformance,
    getBillingUsage,
    getBillingPlans,
    updateBillingPlan,
    predictCost,
} = require('../controllers/apiController');

const Project = require('../models/Project');

const router = express.Router();

router.get('/health', healthCheck);

// Deployed projects for the logged-in user
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ userId: String(req.user.id) })
      .select('repositoryName repositoryUrl status createdAt')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/deployments', listDeployments);
router.post('/deployments/create', createDeployment);
router.get('/deployments/:id', getDeploymentById);
router.get('/deployments/:id/logs', getDeploymentLogs);
router.get('/deployments/:id/status', getDeploymentStatus);

router.get('/analytics/dashboard', authMiddleware, getAnalyticsDashboard);
router.get('/analytics/deployments', getAnalyticsDeployments);
router.get('/analytics/costs', getAnalyticsCosts);
router.get('/analytics/performance', getAnalyticsPerformance);

router.get('/billing/usage', getBillingUsage);
router.get('/billing/plans', getBillingPlans);
router.post('/billing/update-plan', updateBillingPlan);

router.post('/predict-cost', predictCost);

module.exports = router;