const healthCheck = (req, res) => {
    res.json({
        status: 'ok',
        message: 'CloudOps backend is healthy',
        timestamp: new Date().toISOString(),
    });
};

const listDeployments = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use /api/deploy routes for real deployment data.',
    });
};

const createDeployment = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use POST /api/deploy/start for real deployment creation.',
    });
};

const getDeploymentById = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use GET /api/deploy/:deploymentId for real deployment status.',
    });
};

const getDeploymentLogs = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use GET /api/deploy/:deploymentId/logs for real deployment logs.',
    });
};

const getDeploymentStatus = (req, res) => {
    res.status(501).json({
        error: 'Deprecated endpoint. Use GET /api/deploy/:deploymentId for real deployment status.',
    });
};

const Deployment = require('../models/Deployment');
const Project = require('../models/Project');
const axios = require('axios');

const getAnalyticsDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        const githubToken = req.user?.githubToken;

        // Get deployment counts from MongoDB
        const totalDeployments = await Deployment.countDocuments({ userId });
        const activeDeployments = await Deployment.countDocuments({
            userId,
            status: { $in: ['pending', 'cloning', 'detecting', 'building', 'pushing', 'deploying'] },
        });

        // Get project/repo counts from MongoDB
        const totalProjectsDeployed = await Project.countDocuments({ userId });

        // Get total GitHub repos (if token available)
        let totalGitHubRepos = 0;
        if (githubToken) {
            try {
                const response = await axios.get('https://api.github.com/user/repos', {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: 'application/vnd.github+json',
                        'User-Agent': 'CloudOps-App',
                    },
                    params: {
                        visibility: 'all',
                        affiliation: 'owner,collaborator,organization_member',
                        per_page: 100,
                    },
                });
                totalGitHubRepos = response.data.length;
            } catch (error) {
                console.warn('Failed to fetch GitHub repos count:', error.message);
                totalGitHubRepos = 0;
            }
        }

        res.json({
            deployments: totalDeployments,
            activeDeployments,
            totalGitHubRepos,
            connectedRepos: totalProjectsDeployed,
            totalProjectsDeployed,
            uptime: '99.9%',
            totalCost: 0,
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({ error: 'Unable to load analytics dashboard' });
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