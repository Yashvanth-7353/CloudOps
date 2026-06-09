const { runAzureDeployment } = require('../../azureDeployService');
const Deployment = require('../../../models/Deployment');
const { getMappingForApplicationType } = require('../../../config/deploymentMapping');

class ContainerDeploymentStrategy {
  async deploy(input, io) {
    const mapping = getMappingForApplicationType('backend-api');
    const {
      userId,
      repositoryUrl,
      repositoryName,
      applicationName,
      applicationType = 'backend-api',
      socketId,
    } = input;

    const appName = (applicationName || repositoryName || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .slice(0, 32);

    // Azure service creates its own Deployment record
    runAzureDeployment({
      repoUrl: repositoryUrl,
      appName,
      socketId: socketId || null,
      io,
      userId: String(userId || 'anonymous'),
      applicationType,
      deploymentType: mapping.deploymentType,
      provider: mapping.provider,
      applicationName: applicationName || repositoryName,
      estimatedCostMonthly: mapping.estimatedCostMonthlyUsd,
      estimatedDeployMinutes: mapping.estimatedDeployMinutes,
    });

    return {
      success: true,
      message: 'Backend API deployment started',
      appName,
      status: 'deploying',
    };
  }
}

module.exports = new ContainerDeploymentStrategy();
