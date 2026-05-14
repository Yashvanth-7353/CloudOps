/**
 * Deployment Service - Orchestrates AWS Infrastructure
 * Coordinates EC2, ECR, and S3 for application deployments
 * Handles end-to-end deployment workflow
 */

const ec2Service = require('./ec2Service');
const ecrService = require('./ecrService');
const s3Service = require('./s3Service');

class AWSDeploymentService {
  /**
   * Deploy an application to AWS
   * Steps:
   * 1. Create/verify S3 bucket for artifacts
   * 2. Upload application files to S3
   * 3. Create/verify ECR repository
   * 4. Launch EC2 instance
   * 5. Configure security and networking
   */
  async deployApplication(deploymentConfig) {
    try {
      const {
        applicationName,
        dockerImageUri,
        instanceType = 't3.micro',
        amiId,
        keyName,
        securityGroupIds = [],
        environmentVariables = {},
      } = deploymentConfig;

      if (!applicationName || !amiId || !keyName) {
        throw new Error('applicationName, amiId, and keyName are required');
      }

      const deploymentLog = [];

      // Step 1: Create ECR repository if needed
      deploymentLog.push({
        step: 'ECR Setup',
        status: 'in-progress',
        timestamp: new Date(),
      });

      let ecrUri = dockerImageUri;
      if (!dockerImageUri) {
        try {
          const repoResponse = await ecrService.createRepository(applicationName);
          ecrUri = repoResponse.repositoryUri;
          deploymentLog.push({
            step: 'ECR Repository Created',
            status: 'success',
            uri: ecrUri,
            timestamp: new Date(),
          });
        } catch (error) {
          deploymentLog.push({
            step: 'ECR Repository Creation',
            status: 'warning',
            message: error.message,
            timestamp: new Date(),
          });
        }
      }

      // Step 2: Create S3 bucket for deployment artifacts
      deploymentLog.push({
        step: 'S3 Setup',
        status: 'in-progress',
        timestamp: new Date(),
      });

      const bucketName = `cloudops-${applicationName}-${Date.now()}`.toLowerCase();
      try {
        const bucketExists = await s3Service.bucketExists(bucketName);
        if (!bucketExists) {
          await s3Service.createBucket(bucketName, {
            region: process.env.AWS_REGION,
          });
        }
        deploymentLog.push({
          step: 'S3 Bucket',
          status: 'success',
          bucket: bucketName,
          timestamp: new Date(),
        });
      } catch (error) {
        deploymentLog.push({
          step: 'S3 Bucket Creation',
          status: 'warning',
          message: error.message,
          timestamp: new Date(),
        });
      }

      // Step 3: Launch EC2 instance
      deploymentLog.push({
        step: 'EC2 Instance Launch',
        status: 'in-progress',
        timestamp: new Date(),
      });

      const instanceResponse = await ec2Service.createInstance({
        amiId,
        instanceType,
        keyName,
        securityGroupIds,
        tagName: `${applicationName}-instance`,
        tagEnvironment: 'production',
      });

      deploymentLog.push({
        step: 'EC2 Instance Created',
        status: 'success',
        instanceId: instanceResponse.instanceId,
        instanceType: instanceResponse.instanceType,
        timestamp: new Date(),
      });

      // Step 4: Wait for instance and get public IP (with timeout)
      const pollPublicIp = async (attempt = 0, maxAttempts = 10) => {
        try {
          return await ec2Service.getPublicIp(instanceResponse.instanceId);
        } catch (error) {
          if (attempt >= maxAttempts - 1) {
            return null;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
          return pollPublicIp(attempt + 1, maxAttempts);
        }
      };

      const publicIp = await pollPublicIp();

      if (publicIp) {
        deploymentLog.push({
          step: 'Public IP Assignment',
          status: 'success',
          publicIp,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        deployment: {
          applicationName,
          instanceId: instanceResponse.instanceId,
          instanceType,
          publicIp: publicIp || 'Pending',
          ecrUri,
          s3Bucket: bucketName,
          environmentVariables: Object.keys(environmentVariables),
        },
        deploymentLog,
        message: 'Deployment initiated successfully',
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Cleanup/Terminate a deployment
   * Removes EC2 instance, optionally cleans S3 and ECR
   */
  async terminateDeployment(deploymentConfig) {
    try {
      const {
        instanceId,
        bucketName = null,
        repositoryName = null,
        cleanupS3 = false,
        cleanupECR = true,
        deploymentId = null,
      } = deploymentConfig;

      if (!instanceId) {
        throw new Error('instanceId is required');
      }

      const cleanupLog = [];
      let effectiveRepositoryName = repositoryName;
      let existingDeployment = null;

      if (!effectiveRepositoryName && deploymentId) {
        const Deployment = require('../models/Deployment');
        existingDeployment = await Deployment.findById(deploymentId);

        if (existingDeployment) {
          effectiveRepositoryName = existingDeployment.infrastructure?.ecr?.repositoryName;
          if (!effectiveRepositoryName && existingDeployment.infrastructure?.ecr?.repositoryUri) {
            const uriParts = String(existingDeployment.infrastructure.ecr.repositoryUri).split('/');
            effectiveRepositoryName = uriParts[uriParts.length - 1]?.split(':')[0] || null;
          }

          if (!effectiveRepositoryName && existingDeployment.repositoryName) {
            effectiveRepositoryName = `cloudops-${existingDeployment.repositoryName}`.toLowerCase().substring(0, 256);
          }
        }
      }

      // Terminate EC2 instance
      const ec2Response = await ec2Service.terminateInstance(instanceId);
      cleanupLog.push({
        step: 'EC2 Instance Terminated',
        status: 'success',
        previousState: ec2Response.previousState,
        currentState: ec2Response.currentState,
        timestamp: new Date(),
      });

      // Cleanup S3 bucket
      if (cleanupS3 && bucketName) {
        try {
          // Note: In production, you would empty the bucket first
          cleanupLog.push({
            step: 'S3 Bucket Cleanup',
            status: 'warning',
            message: 'Manual S3 bucket deletion required - ensure bucket is empty first',
            timestamp: new Date(),
          });
        } catch (error) {
          cleanupLog.push({
            step: 'S3 Cleanup',
            status: 'error',
            message: error.message,
            timestamp: new Date(),
          });
        }
      }

      // Cleanup ECR repository
      if (cleanupECR && effectiveRepositoryName) {
        try {
          const ecrResponse = await ecrService.deleteRepository(effectiveRepositoryName, {
            force: true,
          });
          cleanupLog.push({
            step: 'ECR Repository Deleted',
            status: 'success',
            repositoryName: effectiveRepositoryName,
            timestamp: new Date(),
          });
        } catch (error) {
          cleanupLog.push({
            step: 'ECR Cleanup',
            status: 'warning',
            message: error.message,
            repositoryName: effectiveRepositoryName,
            timestamp: new Date(),
          });
        }
      }

      // Update deployment status to closed
      if (deploymentId) {
        try {
          const Deployment = require('../models/Deployment');
          await Deployment.findByIdAndUpdate(
            deploymentId,
            {
              status: 'closed',
              phase: 'complete',
              completedAt: new Date(),
              totalTime: Date.now() - (await Deployment.findById(deploymentId)).startedAt,
            },
            { new: true }
          );
          cleanupLog.push({
            step: 'Deployment Status Updated',
            status: 'success',
            newStatus: 'closed',
            timestamp: new Date(),
          });
        } catch (error) {
          cleanupLog.push({
            step: 'Deployment Status Update',
            status: 'warning',
            message: error.message,
            timestamp: new Date(),
          });
        }
      }

      return {
        success: true,
        cleanupLog,
        message: 'Deployment termination completed',
      };
    } catch (error) {
      throw new Error(`Termination failed: ${error.message}`);
    }
  }

  /**
   * Mark a deployment as redeployed
   * Called when a webhook triggers a new deployment for the same project
   */
  async markDeploymentAsRedeployed(deploymentId) {
    try {
      const Deployment = require('../models/Deployment');
      const deployment = await Deployment.findByIdAndUpdate(
        deploymentId,
        {
          status: 'redeployed',
          phase: 'complete',
          completedAt: new Date(),
        },
        { new: true }
      );
      return deployment;
    } catch (error) {
      throw new Error(`Failed to mark deployment as redeployed: ${error.message}`);
    }
  }

  /**
   * Get deployment status
   * Retrieves current state of instance and resources
   */
  async getDeploymentStatus(instanceId) {
    try {
      const instance = await ec2Service.getInstance(instanceId);
      const status = await ec2Service.getInstanceStatus(instanceId);

      return {
        instanceId,
        state: instance.state,
        instanceStatus: status.instanceStatus,
        systemStatus: status.systemStatus,
        publicIp: instance.publicIp,
        privateIp: instance.privateIp,
        instanceType: instance.instanceType,
        launchTime: instance.launchTime,
        tags: instance.tags,
      };
    } catch (error) {
      throw new Error(`Failed to get deployment status: ${error.message}`);
    }
  }

  /**
   * List all deployments (running EC2 instances created by CloudOps)
   */
  async listDeployments() {
    try {
      const instances = await ec2Service.listInstances([
        {
          Name: 'tag:CreatedBy',
          Values: ['CloudOps'],
        },
      ]);

      return instances.map((instance) => ({
        instanceId: instance.instanceId,
        name: instance.tags.Name || 'Unnamed',
        state: instance.state,
        instanceType: instance.instanceType,
        publicIp: instance.publicIp,
        launchTime: instance.launchTime,
        environment: instance.tags.Environment || 'unknown',
      }));
    } catch (error) {
      throw new Error(`Failed to list deployments: ${error.message}`);
    }
  }

  /**
   * Verify AWS credentials and connectivity
   */
  async verifyAwsConnectivity() {
    try {
      // Try basic operations to verify credentials without serial requests
      const [instances, repos, buckets] = await Promise.all([
        ec2Service.listInstances([
          {
            Name: 'instance-state-name',
            Values: ['running'],
          },
        ]),
        ecrService.listRepositories(),
        s3Service.listBuckets(),
      ]);

      return {
        verified: true,
        ec2Available: true,
        ecrAvailable: true,
        s3Available: true,
        summary: {
          runningInstances: instances.length,
          ecrRepositories: repos.length,
          s3Buckets: buckets.length,
        },
        message: 'AWS connectivity verified successfully',
      };
    } catch (error) {
      throw new Error(`AWS connectivity verification failed: ${error.message}`);
    }
  }
}

module.exports = new AWSDeploymentService();
