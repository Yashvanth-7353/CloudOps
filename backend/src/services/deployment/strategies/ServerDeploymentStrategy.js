const deploymentEngine = require('../../deploymentEngineService');
const { getMappingForApplicationType } = require('../../../config/deploymentMapping');

class ServerDeploymentStrategy {
  async deploy(input, io) {
    const mapping = getMappingForApplicationType('full-stack');
    const {
      userId,
      projectId,
      repositoryUrl,
      repositoryName,
      repositoryOwner,
      branch = 'main',
      environmentVariables = {},
      applicationType = 'full-stack',
      applicationName,
      instanceType = 't3.micro',
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
      target: {
        type: 'aws',
        awsRegion: process.env.AWS_REGION || 'ap-south-1',
        instanceType,
        keyName: process.env.AWS_EC2_KEY_NAME,
        securityGroupIds: [],
      },
      triggeredBy: 'manual',
      metadata: {
        userFacingSummary: mapping.userFacingSummary,
        hideInfrastructure: true,
      },
    }, io);

    return result;
  }
}

module.exports = new ServerDeploymentStrategy();
