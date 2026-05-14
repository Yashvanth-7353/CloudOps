/**
 * AWS Routes - REST API endpoints for AWS operations
 * Base path: /api/aws
 */

const express = require('express');
const awsController = require('../controllers/awsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * All AWS routes require authentication
 * The authMiddleware ensures only authenticated users can access AWS resources
 */
router.use(authMiddleware);

// ============== HEALTH & STATUS ==============

/**
 * GET /api/aws/health
 * Verify AWS credentials and connectivity
 */
router.get('/health', async (req, res) => {
  await awsController.healthCheck(req, res);
});

// ============== EC2 ROUTES ==============

/**
 * GET /api/aws/ec2
 * List all EC2 instances
 */
router.get('/ec2', async (req, res) => {
  await awsController.listInstances(req, res);
});

/**
 * GET /api/aws/ec2/:instanceId
 * Get single EC2 instance details
 */
router.get('/ec2/:instanceId', async (req, res) => {
  await awsController.getInstance(req, res);
});

/**
 * GET /api/aws/ec2/:instanceId/status
 * Get instance status (system, instance health)
 */
router.get('/ec2/:instanceId/status', async (req, res) => {
  await awsController.getInstanceStatus(req, res);
});

/**
 * GET /api/aws/ec2/:instanceId/ip
 * Get public IP of instance
 */
router.get('/ec2/:instanceId/ip', async (req, res) => {
  await awsController.getPublicIp(req, res);
});

/**
 * POST /api/aws/ec2/create
 * Create a new EC2 instance
 * Body: { amiId, instanceType, keyName, securityGroupIds?, tagName?, tagEnvironment? }
 */
router.post('/ec2/create', async (req, res) => {
  await awsController.createInstance(req, res);
});

/**
 * POST /api/aws/ec2/start/:instanceId
 * Start a stopped EC2 instance
 */
router.post('/ec2/start/:instanceId', async (req, res) => {
  await awsController.startInstance(req, res);
});

/**
 * POST /api/aws/ec2/stop/:instanceId
 * Stop a running EC2 instance
 */
router.post('/ec2/stop/:instanceId', async (req, res) => {
  await awsController.stopInstance(req, res);
});

/**
 * DELETE /api/aws/ec2/:instanceId
 * Terminate an EC2 instance
 */
router.delete('/ec2/:instanceId', async (req, res) => {
  await awsController.terminateInstance(req, res);
});

// ============== S3 ROUTES ==============

/**
 * GET /api/aws/s3/buckets
 * List all S3 buckets
 */
router.get('/s3/buckets', async (req, res) => {
  await awsController.listBuckets(req, res);
});

/**
 * GET /api/aws/s3/:bucketName/objects
 * List objects in S3 bucket
 * Query: { prefix?, maxKeys? }
 */
router.get('/s3/:bucketName/objects', async (req, res) => {
  await awsController.listObjects(req, res);
});

/**
 * GET /api/aws/s3/:bucketName/presigned-url
 * Generate presigned URL for downloading object
 * Query: { key (required), expiresIn? (default 3600) }
 */
router.get('/s3/:bucketName/presigned-url', async (req, res) => {
  await awsController.getPresignedUrl(req, res);
});

// ============== ECR ROUTES ==============

/**
 * GET /api/aws/ecr/repositories
 * List all ECR repositories
 */
router.get('/ecr/repositories', async (req, res) => {
  await awsController.listRepositories(req, res);
});

/**
 * POST /api/aws/ecr/repositories
 * Create a new ECR repository
 * Body: { repositoryName, tagMutability?, imageScanOnPush? }
 */
router.post('/ecr/repositories', async (req, res) => {
  await awsController.createRepository(req, res);
});

/**
 * GET /api/aws/ecr/auth-token
 * Get ECR authorization token for docker login
 */
router.get('/ecr/auth-token', async (req, res) => {
  await awsController.getAuthToken(req, res);
});

// ============== DEPLOYMENT ROUTES ==============

/**
 * POST /api/aws/deployments
 * Deploy application to AWS infrastructure
 * Body: { applicationName, amiId, keyName, instanceType?, dockerImageUri?, securityGroupIds?, environmentVariables? }
 */
router.post('/deployments', async (req, res) => {
  await awsController.deployApplication(req, res);
});

/**
 * GET /api/aws/deployments
 * List all deployments (CloudOps-created instances)
 */
router.get('/deployments', async (req, res) => {
  await awsController.listDeployments(req, res);
});

/**
 * GET /api/aws/deployments/:instanceId
 * Get deployment status
 */
router.get('/deployments/:instanceId', async (req, res) => {
  await awsController.getDeploymentStatus(req, res);
});

/**
 * DELETE /api/aws/deployments/:instanceId
 * Terminate deployment and cleanup resources
 * Body: { bucketName?, repositoryName?, cleanupS3?, cleanupECR? }
 */
router.delete('/deployments/:instanceId', async (req, res) => {
  await awsController.terminateDeployment(req, res);
});

module.exports = router;
