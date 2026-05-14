const deploymentEngine = require('../services/deploymentEngineService');

const healthCheck = (req, res) => {
    res.json({
        status: 'ok',
        message: 'CloudOps backend is healthy',
        timestamp: new Date().toISOString(),
    });
};

const listDeployments = async (req, res) => {
    try {
        const deployments = await deploymentEngine.listDeployments({
            projectId: req.query.projectId,
            userId: req.query.userId,
            status: req.query.status,
        });

        return res.status(200).json({
            success: true,
            data: deployments,
            count: deployments.length,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to list deployments',
        });
    }
};

const createDeployment = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use POST /api/deploy/start for real deployment creation.',
    });
};

const getDeploymentById = async (req, res) => {
    try {
        const deployment = await deploymentEngine.getDeploymentDetails(req.params.id);

        return res.status(200).json({
            success: true,
            deployment,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || 'Deployment not found',
        });
    }
};

const getDeploymentLogs = async (req, res) => {
    try {
        const logs = await deploymentEngine.getDeploymentLogs(req.params.id, {
            source: req.query.source || null,
            level: req.query.level || null,
            limit: Number(req.query.limit || 100),
            skip: Number(req.query.skip || 0),
        });

        return res.status(200).json({
            success: true,
            logs,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || 'Deployment logs not found',
        });
    }
};

const getDeploymentStatus = async (req, res) => {
    try {
        const deployment = await deploymentEngine.getDeploymentDetails(req.params.id);

        return res.status(200).json({
            success: true,
            deployment,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || 'Deployment status not found',
        });
    }
};

const Deployment = require('../models/Deployment');
const User = require('../models/User');
const Project = require('../models/Project');

const getAnalyticsDashboard = async (req, res) => {
    try {
        // Total deployments
        const totalDeployments = await Deployment.countDocuments();

        // Successful deployments
        const successfulDeployments = await Deployment.countDocuments({ status: 'success' });

        // Deployments in last 30 days
        const thirtyDays = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
        const monthlyDeployments = await Deployment.countDocuments({ createdAt: { $gte: thirtyDays } });

        // Average deploy time for successful deployments (ms -> human readable)
        const avgAgg = await Deployment.aggregate([
            { $match: { status: 'success', deployTime: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgDeployTimeMs: { $avg: '$deployTime' } } },
        ]);
        const avgDeployTimeMs = (avgAgg && avgAgg[0] && Math.round(avgAgg[0].avgDeployTimeMs)) || null;

        // Active users (approx) - users with lastLoginAt within 90 days
        const ninetyDays = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
        const activeUsers = await User.countDocuments({ lastLoginAt: { $gte: ninetyDays } });

        // Projects count
        const projectsCount = await Project.countDocuments();

        // Platform uptime - placeholder for now (calculate from monitoring in production)
        const uptime = '99.9%';

        return res.status(200).json({
            success: true,
            metrics: {
                totalDeployments,
                successfulDeployments,
                monthlyDeployments,
                avgDeployTimeMs,
                activeUsers,
                projectsCount,
                uptime,
            },
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

const getAnalyticsDeployments = (req, res) => {
    res.json({ data: [] });
};

const getAnalyticsCosts = (req, res) => {
    res.json({ data: [] });
};

const getAnalyticsPerformance = (req, res) => {
    res.json({ data: [] });
};

const getBillingUsage = (req, res) => {
    res.json({ usage: 0 });
};

const getBillingPlans = (req, res) => {
    res.json({ plans: [] });
};

const updateBillingPlan = (req, res) => {
    res.json({ message: 'Plan updated' });
};

const predictCost = (req, res) => {
    res.json({ message: 'Cost calculation logic will live here' });
};

module.exports = {
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
};