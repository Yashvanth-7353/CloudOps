/**
 * Deployment Controller
 * Handles deployment endpoints
 */

const deploymentService = require('../services/deploymentService');
const Deployment = require('../models/Deployment');

class DeploymentController {
  /**
   * Start a new deployment
   * POST /api/deploy/start
   */
  async startDeployment(req, res) {
    try {
      const userId = req.user.id;
      const { projectId, repositoryUrl, environmentVariables = {}, branch = 'main' } = req.body;

      // Validation
      if (!projectId || !repositoryUrl) {
        return res.status(400).json({
          error: 'Missing required fields: projectId, repositoryUrl',
        });
      }

      // Start deployment
      const result = await deploymentService.startDeployment(projectId, userId, {
        repositoryUrl,
        environmentVariables,
        branch,
      });

      // Execute deployment asynchronously (will integrate with job queue in Phase 6)
      deploymentService.executeDeployment(result.deploymentId).catch((error) => {
        console.error('Deployment execution error:', error);
      });

      res.json({
        success: true,
        deploymentId: result.deploymentId,
        status: 'queued',
        message: 'Deployment started',
      });
    } catch (error) {
      console.error('Start deployment error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get deployment status
   * GET /api/deploy/:deploymentId
   */
  async getDeploymentStatus(req, res) {
    try {
      const { deploymentId } = req.params;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const details = await deploymentService.getDeploymentDetails(deploymentId);

      res.json({
        success: true,
        deployment: details,
      });
    } catch (error) {
      console.error('Get deployment status error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get deployment logs
   * GET /api/deploy/:deploymentId/logs
   */
  async getDeploymentLogs(req, res) {
    try {
      const { deploymentId } = req.params;
      const { source, level, limit = 100, skip = 0 } = req.query;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const logs = await deploymentService.getDeploymentLogs(deploymentId, {
        source,
        level,
        limit: Math.min(parseInt(limit) || 100, 1000),
        skip: parseInt(skip) || 0,
      });

      res.json({
        success: true,
        logs,
        total: deployment.logs.length,
      });
    } catch (error) {
      console.error('Get deployment logs error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * List deployments for a project
   * GET /api/projects/:projectId/deployments
   */
  async listDeployments(req, res) {
    try {
      const { projectId } = req.params;
      const { status, limit = 20, skip = 0 } = req.query;

      const result = await deploymentService.listProjectDeployments(projectId, {
        status,
        limit: Math.min(parseInt(limit) || 20, 100),
        skip: parseInt(skip) || 0,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('List deployments error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Cancel deployment
   * POST /api/deploy/:deploymentId/cancel
   */
  async cancelDeployment(req, res) {
    try {
      const { deploymentId } = req.params;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const result = await deploymentService.cancelDeployment(deploymentId);

      res.json({
        success: true,
        message: 'Deployment cancelled',
        status: result.status,
      });
    } catch (error) {
      console.error('Cancel deployment error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Retry deployment
   * POST /api/deploy/:deploymentId/retry
   */
  async retryDeployment(req, res) {
    try {
      const { deploymentId } = req.params;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Check if can retry
      if (!deployment.canRetry()) {
        return res.status(400).json({
          error: `Max retries (${deployment.maxRetries}) reached`,
        });
      }

      deployment.incrementRetry();
      deployment.status = 'pending';
      deployment.phase = 'preparation';
      deployment.error = null;
      deployment.completedAt = null;
      deployment.addLog('system', 'info', `Retry attempt ${deployment.retryCount}/${deployment.maxRetries}`);

      await deployment.save();

      // Execute deployment asynchronously
      deploymentService.executeDeployment(deploymentId).catch((error) => {
        console.error('Retry deployment execution error:', error);
      });

      res.json({
        success: true,
        message: `Deployment retry ${deployment.retryCount} initiated`,
        deploymentId,
      });
    } catch (error) {
      console.error('Retry deployment error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get deployment metrics
   * GET /api/deploy/:deploymentId/metrics
   */
  async getDeploymentMetrics(req, res) {
    try {
      const { deploymentId } = req.params;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const metrics = {
        status: deployment.status,
        framework: deployment.framework,
        totalTime: deployment.totalTime,
        buildTime: deployment.buildTime,
        deployTime: deployment.deployTime,
        dockerImageSize: deployment.dockerImageSize,
        repositorySize: deployment.metadata?.repositorySize,
        logsCount: deployment.logs.length,
        errorCount: deployment.logs.filter((l) => l.level === 'error').length,
        warningCount: deployment.logs.filter((l) => l.level === 'warn').length,
        startedAt: deployment.startedAt,
        completedAt: deployment.completedAt,
      };

      res.json({
        success: true,
        metrics,
      });
    } catch (error) {
      console.error('Get deployment metrics error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get dockerfile for a deployment
   * GET /api/deploy/:deploymentId/dockerfile
   */
  async getDockerfile(req, res) {
    try {
      const { deploymentId } = req.params;

      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Check authorization
      if (deployment.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (!deployment.dockerfile) {
        return res.status(404).json({ error: 'Dockerfile not found' });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.send(deployment.dockerfile);
    } catch (error) {
      console.error('Get dockerfile error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get project deployment statistics
   * GET /api/projects/:projectId/deployment-stats
   */
  async getDeploymentStats(req, res) {
    try {
      const { projectId } = req.params;

      const deployments = await Deployment.find({ projectId });

      if (deployments.length === 0) {
        return res.json({
          success: true,
          stats: {
            totalDeployments: 0,
            successfulDeployments: 0,
            failedDeployments: 0,
            averageDeployTime: 0,
            lastDeployment: null,
          },
        });
      }

      const successful = deployments.filter((d) => d.status === 'success');
      const failed = deployments.filter((d) => d.status === 'failed');

      const avgTime =
        successful.length > 0
          ? successful.reduce((sum, d) => sum + (d.totalTime || 0), 0) / successful.length
          : 0;

      const lastDeploy = deployments.sort((a, b) => b.createdAt - a.createdAt)[0];

      const stats = {
        totalDeployments: deployments.length,
        successfulDeployments: successful.length,
        failedDeployments: failed.length,
        successRate: ((successful.length / deployments.length) * 100).toFixed(2) + '%',
        averageDeployTime: Math.round(avgTime / 1000), // in seconds
        lastDeployment: lastDeploy
          ? {
              status: lastDeploy.status,
              framework: lastDeploy.framework,
              deployedAt: lastDeploy.createdAt,
              totalTime: lastDeploy.totalTime,
            }
          : null,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Get deployment stats error:', error);
      res.status(500).json({
        error: error.message,
      });
    }
  }
}

module.exports = new DeploymentController();
