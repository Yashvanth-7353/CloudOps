const deploymentEngine = require('../../deploymentEngineService');
const { getMappingForApplicationType } = require('../../../config/deploymentMapping');

class ContainerDeploymentStrategy {
  async deploy(input, io) {
    const mapping = getMappingForApplicationType('backend-api');
    const {
      userId,
      projectId,
      repositoryUrl,
      repositoryName,
      repositoryOwner,
      applicationName,
      applicationType = 'backend-api',
      branch = 'main',
      environmentVariables = {},
      rootDirectory = './',
    } = input;

    const result = await deploymentEngine.startDeployment({
      projectId,
      userId: String(userId || 'anonymous'),
      repositoryUrl,
      repositoryName,
      repositoryOwner,
      branch,
      environmentVariables,
      applicationType,
      applicationName: applicationName || repositoryName,
      deploymentType: mapping.deploymentType,
      provider: mapping.provider,
      estimatedCostMonthly: mapping.estimatedCostMonthlyUsd,
      estimatedDeployMinutes: mapping.estimatedDeployMinutes,
      target: { type: 'local' },
      triggeredBy: 'manual',
      metadata: {
        rootDirectory,
        userFacingSummary: mapping.userFacingSummary,
        hideInfrastructure: true,
        runtime: 'nodejs',
      },
    }, io);

    return {
      success: true,
      message: 'Backend API deployment started (npm install + npm start via container)',
      deploymentId: result.deploymentId,
      status: result.status || 'queued',
    };
  }
}

module.exports = new ContainerDeploymentStrategy();
