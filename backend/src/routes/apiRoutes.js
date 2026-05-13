const express = require('express');
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

const router = express.Router();

router.get('/health', healthCheck);

router.get('/deployments', listDeployments);
router.post('/deployments/create', createDeployment);
router.get('/deployments/:id', getDeploymentById);
router.get('/deployments/:id/logs', getDeploymentLogs);
router.get('/deployments/:id/status', getDeploymentStatus);

router.get('/analytics/dashboard', getAnalyticsDashboard);
router.get('/analytics/deployments', getAnalyticsDeployments);
router.get('/analytics/costs', getAnalyticsCosts);
router.get('/analytics/performance', getAnalyticsPerformance);

router.get('/billing/usage', getBillingUsage);
router.get('/billing/plans', getBillingPlans);
router.post('/billing/update-plan', updateBillingPlan);

router.post('/predict-cost', predictCost);

module.exports = router;