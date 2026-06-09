const path = require('path');
const Deployment = require('../../../models/Deployment');
const staticBuildService = require('../../staticBuildService');
const frameworkDetector = require('../../frameworkDetector');
const { getMappingForApplicationType } = require('../../../config/deploymentMapping');

class StaticDeploymentStrategy {
  normalizeLevel(level) {
    if (['debug', 'info', 'warn', 'error', 'success'].includes(level)) return level;
    return 'info';
  }

  emit(io, deployment, message, level = 'info', source = 'app') {
    const normalizedLevel = this.normalizeLevel(level);
    const validSource = ['system', 'git', 'framework', 'docker', 'aws', 'azure', 'acr', 'aci', 'app'].includes(source)
      ? source
      : 'app';

    // Add log locally for immediate use
    deployment.addLog(validSource, normalizedLevel, message, {}, 's3-static');

    // Persist atomically using findOneAndUpdate to avoid concurrent save conflicts
    const logEntry = {
      timestamp: new Date(),
      source: validSource,
      level: normalizedLevel,
      message,
      data: {},
      deploymentService: 's3-static',
    };

    Deployment.findOneAndUpdate(
      { _id: deployment._id },
      { $push: { logs: logEntry } },
      { new: true }
    ).catch((err) => {
      console.error('Failed to persist deployment log:', err.message);
    });

    const room = deployment.repositoryName;
    const deploymentRoom = `deployment:${deployment._id}`;
    const payload = {
      deploymentId: deployment._id.toString(),
      message,
      level: normalizedLevel,
      timestamp: new Date().toISOString(),
      applicationType: deployment.applicationType,
    };

    if (io) {
      io.to(room).emit('deployment-log', payload);
      io.to(deploymentRoom).emit('deployment-log', payload);
      io.to(room).emit('build-log', { text: message, type: level, timestamp: payload.timestamp });
    }
  }

  async deploy(input, io) {
    const mapping = getMappingForApplicationType('frontend-website');
    const {
      userId,
      projectId,
      repositoryUrl,
      repositoryName,
      clonePath,
      rootDirectory = './',
      applicationName,
      applicationType = 'frontend-website',
      environmentVariables = {},
    } = input;

    const deployment = new Deployment({
      ...(projectId && { projectId }),
      userId: String(userId || 'anonymous'),
      repositoryUrl,
      repositoryName,
      applicationType,
      applicationName: applicationName || repositoryName,
      deploymentType: mapping.deploymentType,
      provider: mapping.provider,
      deploymentService: 's3-static',
      status: 'building',
      phase: 'docker_build',
      branch: input.branch || 'main',
      environmentVariables: Object.entries(environmentVariables).map(([key, value]) => ({
        key,
        value: String(value),
        encrypted: false,
      })),
      estimatedCostMonthly: mapping.estimatedCostMonthlyUsd,
      estimatedDeployMinutes: mapping.estimatedDeployMinutes,
      healthStatus: 'checking',
      startedAt: new Date(),
      infrastructure: {
        provider: mapping.provider,
        targetType: 's3-static',
        deployState: 'building',
      },
      metadata: {
        rootDirectory,
        userFacingSummary: mapping.userFacingSummary,
        hideInfrastructure: true,
      },
    });

    await deployment.save();

    setImmediate(() => {
      this.runBuild(deployment, input, io).catch((error) => {
        console.error('Static deployment failed:', error);
      });
    });

    return {
      success: true,
      deploymentId: deployment._id.toString(),
      status: 'building',
    };
  }

  async runBuild(deployment, input, io) {
    const {
      repositoryName,
      clonePath,
      rootDirectory = './',
      buildCommand,
      outputDirectory,
      environmentVariables = {},
      applicationType = 'frontend-website',
    } = input;

    const projectPath = rootDirectory && rootDirectory !== './'
      ? path.join(clonePath, rootDirectory.replace(/^\.\//, ''))
      : clonePath;

    try {
      this.emit(io, deployment, 'Preparing your website for deployment...', 'info', 'system');

      const bucket = staticBuildService.getS3BucketName();
      if (!bucket) {
        throw new Error('AWS_S3_BUCKET_NAME is not configured in backend/.env');
      }

      this.emit(io, deployment, `Verifying S3 access for bucket: ${bucket}...`, 'info', 'system');
      await staticBuildService.verifyBucketAccess(
        bucket,
        (text, type) => this.emit(io, deployment, text, type, 'aws')
      );

      const detection = await frameworkDetector.detectFramework(clonePath, {
        rootDirectory,
        mode: 'static',
      });
      const finalBuildCommand = buildCommand || detection.buildCommand;
      const finalOutputDir = outputDirectory || detection.outputDirectory;

      if (finalBuildCommand && !finalBuildCommand.includes('No build needed')) {
        await staticBuildService.buildProject({
          projectPath,
          buildCommand: finalBuildCommand,
          environmentVariables,
          onLog: (text, type) => this.emit(io, deployment, text, type, 'app'),
        });
      } else {
        this.emit(io, deployment, 'Publishing static files...', 'info', 'app');
      }

      const siteSlug = staticBuildService.generateSiteSlug(repositoryName);
      const publicUrl = await staticBuildService.deployStaticToS3({
        projectPath,
        outputDirectory: finalOutputDir,
        siteSlug,
        skipAccessVerify: true,
        onLog: (text, type) => this.emit(io, deployment, text, type, 'aws'),
      });

      deployment.publicUrl = publicUrl;
      deployment.domainUrl = publicUrl;
      deployment.status = 'success';
      deployment.phase = 'complete';
      deployment.healthStatus = 'healthy';
      deployment.completedAt = new Date();
      
      // Update infrastructure with only the fields we need (avoid undefined values)
      if (!deployment.infrastructure) {
        deployment.infrastructure = {};
      }
      deployment.infrastructure.provider = deployment.infrastructure.provider || 'aws';
      deployment.infrastructure.targetType = 's3-static';
      deployment.infrastructure.s3 = {
        bucket: staticBuildService.getS3BucketName(),
        prefix: siteSlug,
        siteSlug,
        websiteUrl: publicUrl,
      };
      deployment.infrastructure.liveUrl = publicUrl;
      deployment.infrastructure.deployState = 'live';
      
      deployment.markAsSuccess(publicUrl, Date.now() - deployment.startedAt.getTime());
      this.emit(io, deployment, `Deployment complete! Live URL: ${publicUrl}`, 'success', 'system');
      await deployment.save();

      const completePayload = {
        status: 'success',
        deploymentId: deployment._id.toString(),
        publicUrl,
        liveUrl: publicUrl,
        applicationType,
        deployType: 'static',
      };

      if (io) {
        io.to(repositoryName).emit('build-complete', completePayload);
        io.to(repositoryName).emit('deployment-complete', completePayload);
        io.to(`deployment:${deployment._id}`).emit('deployment-complete', completePayload);
      }

      return {
        success: true,
        deploymentId: deployment._id.toString(),
        publicUrl,
        status: 'success',
      };
    } catch (error) {
      this.emit(io, deployment, error.message || 'Deployment failed', 'error', 'system');
      deployment.markAsFailed(error);
      deployment.healthStatus = 'unhealthy';
      await deployment.save();

      if (io) {
        const failPayload = {
          status: 'failed',
          error: error.message,
          deploymentId: deployment._id.toString(),
        };
        io.to(repositoryName).emit('build-complete', failPayload);
        io.to(repositoryName).emit('deployment-complete', failPayload);
        io.to(`deployment:${deployment._id}`).emit('deployment-complete', failPayload);
      }

      throw error;
    }
  }
}

module.exports = new StaticDeploymentStrategy();
