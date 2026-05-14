/**
 * AWS Controller - Handles AWS operations via HTTP
 * Provides REST endpoints for EC2, S3, ECR, and deployment management
 */

const ec2Service = require('../services/aws/ec2Service');
const s3Service = require('../services/aws/s3Service');
const ecrService = require('../services/aws/ecrService');
const deploymentService = require('../services/aws/deploymentService');

class AWSController {
  // ============== EC2 ENDPOINTS ==============

  /**
   * GET /api/aws/ec2
   * List all EC2 instances
   */
  async listInstances(req, res) {
    try {
      const instances = await ec2Service.listInstances();
      res.json({
        success: true,
        data: instances,
        count: instances.length,
      });
    } catch (error) {
      console.error('List instances error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/ec2/:instanceId
   * Get single EC2 instance details
   */
  async getInstance(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const instance = await ec2Service.getInstance(instanceId);
      res.json({
        success: true,
        data: instance,
      });
    } catch (error) {
      console.error('Get instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aws/ec2/create
   * Create a new EC2 instance
   */
  async createInstance(req, res) {
    try {
      const {
        amiId,
        instanceType,
        keyName,
        securityGroupIds,
        tagName,
        tagEnvironment,
      } = req.body;

      // Validation
      const errors = [];
      if (!amiId) errors.push('amiId is required');
      if (!instanceType) errors.push('instanceType is required');
      if (!keyName) errors.push('keyName is required (EC2 Key Pair name)');

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      const instance = await ec2Service.createInstance({
        amiId,
        instanceType,
        keyName,
        securityGroupIds: securityGroupIds || [],
        tagName: tagName || 'CloudOps-Instance',
        tagEnvironment: tagEnvironment || 'development',
      });

      res.status(201).json({
        success: true,
        data: instance,
        message: 'EC2 instance creation initiated',
      });
    } catch (error) {
      console.error('Create instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aws/ec2/start/:instanceId
   * Start a stopped EC2 instance
   */
  async startInstance(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const result = await ec2Service.startInstance(instanceId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Start instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aws/ec2/stop/:instanceId
   * Stop a running EC2 instance
   */
  async stopInstance(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const result = await ec2Service.stopInstance(instanceId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Stop instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/aws/ec2/:instanceId
   * Terminate an EC2 instance
   */
  async terminateInstance(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const result = await ec2Service.terminateInstance(instanceId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Terminate instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/ec2/:instanceId/ip
   * Get public IP of an instance
   */
  async getPublicIp(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const publicIp = await ec2Service.getPublicIp(instanceId);
      res.json({
        success: true,
        data: {
          instanceId,
          publicIp,
        },
      });
    } catch (error) {
      console.error('Get public IP error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/ec2/:instanceId/status
   * Get instance status
   */
  async getInstanceStatus(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const status = await ec2Service.getInstanceStatus(instanceId);
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Get instance status error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============== S3 ENDPOINTS ==============

  /**
   * GET /api/aws/s3/buckets
   * List all S3 buckets
   */
  async listBuckets(req, res) {
    try {
      const buckets = await s3Service.listBuckets();
      res.json({
        success: true,
        data: buckets,
        count: buckets.length,
      });
    } catch (error) {
      console.error('List buckets error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/s3/:bucketName/objects
   * List objects in S3 bucket
   */
  async listObjects(req, res) {
    try {
      const { bucketName } = req.params;
      const { prefix, maxKeys } = req.query;

      if (!bucketName) {
        return res.status(400).json({
          success: false,
          error: 'bucketName is required',
        });
      }

      const objects = await s3Service.listObjects(bucketName, {
        prefix: prefix || '',
        maxKeys: parseInt(maxKeys) || 100,
      });

      res.json({
        success: true,
        data: objects,
        count: objects.length,
      });
    } catch (error) {
      console.error('List objects error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/s3/:bucketName/presigned-url
   * Generate presigned URL for object
   */
  async getPresignedUrl(req, res) {
    try {
      const { bucketName } = req.params;
      const { key, expiresIn } = req.query;

      if (!bucketName || !key) {
        return res.status(400).json({
          success: false,
          error: 'bucketName and key are required',
        });
      }

      const result = await s3Service.getPresignedUrl(
        bucketName,
        key,
        parseInt(expiresIn) || 3600
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get presigned URL error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============== ECR ENDPOINTS ==============

  /**
   * GET /api/aws/ecr/repositories
   * List all ECR repositories
   */
  async listRepositories(req, res) {
    try {
      const repositories = await ecrService.listRepositories();
      res.json({
        success: true,
        data: repositories,
        count: repositories.length,
      });
    } catch (error) {
      console.error('List repositories error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aws/ecr/repositories
   * Create a new ECR repository
   */
  async createRepository(req, res) {
    try {
      const { repositoryName, tagMutability, imageScanOnPush } = req.body;

      if (!repositoryName) {
        return res.status(400).json({
          success: false,
          error: 'repositoryName is required',
        });
      }

      const repository = await ecrService.createRepository(repositoryName, {
        tagMutability: tagMutability || 'MUTABLE',
        imageScanOnPush: imageScanOnPush !== false,
      });

      res.status(201).json({
        success: true,
        data: repository,
      });
    } catch (error) {
      console.error('Create repository error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/ecr/auth-token
   * Get ECR authorization token
   */
  async getAuthToken(req, res) {
    try {
      const token = await ecrService.getAuthorizationToken();
      res.json({
        success: true,
        data: token,
      });
    } catch (error) {
      console.error('Get auth token error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============== DEPLOYMENT ENDPOINTS ==============

  /**
   * POST /api/aws/deployments
   * Deploy application to AWS
   */
  async deployApplication(req, res) {
    try {
      const {
        applicationName,
        dockerImageUri,
        instanceType,
        amiId,
        keyName,
        securityGroupIds,
        environmentVariables,
      } = req.body;

      const errors = [];
      if (!applicationName) errors.push('applicationName is required');
      if (!amiId) errors.push('amiId is required');
      if (!keyName) errors.push('keyName is required');

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      const deployment = await deploymentService.deployApplication({
        applicationName,
        dockerImageUri,
        instanceType: instanceType || 't3.micro',
        amiId,
        keyName,
        securityGroupIds: securityGroupIds || [],
        environmentVariables: environmentVariables || {},
      });

      res.status(201).json({
        success: true,
        data: deployment,
      });
    } catch (error) {
      console.error('Deploy application error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/deployments
   * List all deployments
   */
  async listDeployments(req, res) {
    try {
      const deployments = await deploymentService.listDeployments();
      res.json({
        success: true,
        data: deployments,
        count: deployments.length,
      });
    } catch (error) {
      console.error('List deployments error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/deployments/:instanceId
   * Get deployment status
   */
  async getDeploymentStatus(req, res) {
    try {
      const { instanceId } = req.params;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const status = await deploymentService.getDeploymentStatus(instanceId);
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Get deployment status error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/aws/deployments/:instanceId
   * Terminate deployment
   */
  async terminateDeployment(req, res) {
    try {
      const { instanceId } = req.params;
      const { bucketName, repositoryName, cleanupS3, cleanupECR } = req.body;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required',
        });
      }

      const result = await deploymentService.terminateDeployment({
        instanceId,
        bucketName,
        repositoryName,
        cleanupS3: cleanupS3 || false,
        cleanupECR: cleanupECR || false,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Terminate deployment error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aws/health
   * Verify AWS connectivity
   */
  async healthCheck(req, res) {
    try {
      const health = await deploymentService.verifyAwsConnectivity();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AWSController();
