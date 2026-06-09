/**
 * Deployment Model
 * Stores deployment records and status
 */

const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,  // Can be null for ad-hoc deployments without a connected project
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'cloning', 'detecting', 'building', 'pushing', 'deploying', 'running', 'stopped', 'success', 'failed', 'cancelled', 'closed', 'redeployed'],
      default: 'pending',
      index: true,
    },
    phase: {
      type: String,
      enum: ['preparation', 'queued', 'clone', 'framework_detection', 'dockerfile_generation', 'docker_build', 'container_start', 'nginx_setup', 'push_ecr', 'ec2_launch', 'ecs_deploy', 'dns_setup', 'cleanup', 'complete'],
      default: 'preparation',
    },
    // Git information
    commitHash: String,
    commitShortHash: String,
    commitMessage: String,
    commitAuthor: String,
    commitDate: Date,
    branch: {
      type: String,
      default: 'main',
    },
    repositoryUrl: String,
    repositoryName: String,

    // Framework detection
    framework: {
      type: String,
      enum: ['nodejs', 'python', 'java', 'go', 'ruby', 'php', 'rust', 'dotnet', 'static', 'custom'],
    },
    frameworkVersion: String,
    frameworkDetails: mongoose.Schema.Types.Mixed,

    // Docker information
    dockerImageUri: String,
    dockerImageTag: String,
    dockerBuildTime: Number, // in milliseconds
    dockerImageSize: Number, // in bytes
    dockerfile: String, // Dockerfile content

    // Deployment service type (AWS or Azure)
    deploymentService: {
      type: String,
      enum: ['local', 'aws', 'azure', 's3-static'],
      default: 'aws',
      index: true,
    },

    // Infrastructure / cloud deployment details
    infrastructure: {
      provider: {
        type: String,
        default: 'aws',
      },
      targetType: {
        type: String,
        enum: ['local', 'ssh', 'aws', 'azure', 's3-static'],
      },
      s3: {
        bucket: String,
        prefix: String,
        siteSlug: String,
        websiteUrl: String,
      },
      region: String,
      target: mongoose.Schema.Types.Mixed,
      // AWS-specific fields
      ecr: {
        repositoryArn: String,
        repositoryName: String,
        repositoryUri: String,
        imageUri: String,
        imageTag: String,
      },
      ec2: {
        instanceId: String,
        publicIp: String,
        privateIp: String,
        instanceType: String,
        keyName: String,
        securityGroupIds: [String],
        vpcId: String,
      },
      // Azure-specific fields
      acr: {
        loginServer: String,
        repositoryName: String,
        imageUri: String,
        imageTag: String,
        imageName: String,
      },
      aci: {
        containerGroupName: String,
        containerName: String,
        resourceGroupName: String,
        location: String,
        cpu: Number,
        memoryInGb: Number,
        status: String,
        fqdn: String,
        ipAddress: String,
        containerGroupId: String,
      },
      container: {
        name: String,
        imageName: String,
        port: Number,
      },
      liveUrl: String,
      deployState: String,
    },

    // ECS deployment
    ecsClusterName: String,
    ecsServiceName: String,
    ecsTaskDefinitionArn: String,
    ecsServiceArn: String,
    ecsTaskArn: String,
    ecsDomainName: String,
    ecsPublicIp: String,

    // DNS/URL information
    publicUrl: String,
    subdomainName: String,
    customDomain: String,

    // Timing
    buildTime: Number, // in milliseconds
    deployTime: Number, // in milliseconds
    totalTime: Number, // in milliseconds
    startedAt: Date,
    completedAt: Date,

    // Environment & configuration
    environmentVariables: [{
      key: String,
      value: String,
      encrypted: {
        type: Boolean,
        default: false,
      },
    }],
    instanceType: {
      type: String,
      default: 'fargate-256-512', // 256 CPU units, 512 MB memory
    },
    desiredCount: {
      type: Number,
      default: 1,
    },

    // Trigger information
    triggeredBy: {
      type: String,
      enum: ['manual', 'webhook'],
      default: 'manual',
    },
    webhookId: String,

    // Error handling
    error: {
      message: String,
      code: String,
      phase: String,
      timestamp: Date,
      stack: String,
    },
    failureReason: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },

    // Logs with service separation
    logs: [{
      timestamp: Date,
      source: {
        type: String,
        enum: ['system', 'git', 'framework', 'docker', 'aws', 'ecr', 'ecs', 'route53', 'azure', 'acr', 'aci', 'app'],
      },
      level: {
        type: String,
        enum: ['debug', 'info', 'warn', 'error', 'success'],
      },
      message: String,
      deploymentService: {
        type: String,
        enum: ['local', 'aws', 'azure'],
      },
      data: mongoose.Schema.Types.Mixed,
    }],

    // Separate log collections for easier querying
    awsLogs: [{
      timestamp: Date,
      source: {
        type: String,
        enum: ['system', 'git', 'framework', 'docker', 'aws', 'ecr', 'ecs', 'route53', 'app'],
      },
      level: {
        type: String,
        enum: ['debug', 'info', 'warn', 'error', 'success'],
      },
      message: String,
      data: mongoose.Schema.Types.Mixed,
    }],

    azureLogs: [{
      timestamp: Date,
      source: {
        type: String,
        enum: ['system', 'git', 'framework', 'docker', 'azure', 'acr', 'aci', 'app'],
      },
      level: {
        type: String,
        enum: ['debug', 'info', 'warn', 'error', 'success'],
      },
      message: String,
      data: mongoose.Schema.Types.Mixed,
    }],

    // Rollback information
    previousDeploymentId: mongoose.Schema.Types.ObjectId,
    canRollback: {
      type: Boolean,
      default: true,
    },

    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: 'deployments',
  }
);

// Indexes for efficient querying
DeploymentSchema.index({ projectId: 1, createdAt: -1 });
DeploymentSchema.index({ userId: 1, createdAt: -1 });
DeploymentSchema.index({ status: 1, createdAt: -1 });
DeploymentSchema.index({ publicUrl: 1 }, { sparse: true });

// Methods
DeploymentSchema.methods.addLog = function (source, level, message, data = {}, deploymentService = null) {
  const logEntry = {
    timestamp: new Date(),
    source,
    level,
    message,
    data,
  };

  // Add to unified logs
  this.logs.push({
    ...logEntry,
    deploymentService: deploymentService || this.deploymentService,
  });

  // Add to service-specific logs
  if (deploymentService === 'aws' || (!deploymentService && this.deploymentService === 'aws')) {
    this.awsLogs.push(logEntry);
  } else if (deploymentService === 'azure' || (!deploymentService && this.deploymentService === 'azure')) {
    this.azureLogs.push(logEntry);
  }
};

// Get logs for a specific service
DeploymentSchema.methods.getServiceLogs = function (service) {
  if (service === 'aws') {
    return this.awsLogs || [];
  } else if (service === 'azure') {
    return this.azureLogs || [];
  }
  return this.logs || [];
};

DeploymentSchema.methods.updateStatus = function (status, phase = null) {
  this.status = status;
  if (phase) {
    this.phase = phase;
  }
};

DeploymentSchema.methods.markAsSuccess = function (publicUrl, totalTime) {
  this.status = 'success';
  this.phase = 'complete';
  this.publicUrl = publicUrl;
  this.totalTime = totalTime;
  this.completedAt = new Date();
};

DeploymentSchema.methods.markAsFailed = function (error, phase) {
  this.status = 'failed';
  this.failureReason = error.message;
  this.error = {
    message: error.message,
    code: error.code,
    phase,
    timestamp: new Date(),
    stack: error.stack,
  };
  this.completedAt = new Date();
};

DeploymentSchema.methods.incrementRetry = function () {
  this.retryCount += 1;
};

DeploymentSchema.methods.canRetry = function () {
  return this.retryCount < this.maxRetries;
};

// Statics
DeploymentSchema.statics.getLatestByProject = function (projectId) {
  return this.findOne({ projectId }).sort({ createdAt: -1 });
};

DeploymentSchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

DeploymentSchema.statics.getSuccessfulDeployments = function (projectId, limit = 10) {
  return this.find({ projectId, status: 'success' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Deployment = mongoose.model('Deployment', DeploymentSchema);

module.exports = Deployment;
