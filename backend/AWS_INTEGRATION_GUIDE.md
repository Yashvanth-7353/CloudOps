# AWS Integration Layer - CloudOps Deployment Platform

## Overview

The AWS integration layer provides a complete abstraction for managing cloud infrastructure on Amazon Web Services. It enables programmatic deployment of applications to AWS EC2 instances with integrated Docker container support via ECR.

## Architecture

```
┌─────────────────────────────────────────┐
│        Express REST API (awsRoutes)    │
├─────────────────────────────────────────┤
│      AWS Controller (awsController)    │
├─────────────────────────────────────────┤
│  Services Layer                          │
│  ├── EC2 Service (ec2Service.js)       │
│  ├── S3 Service (s3Service.js)         │
│  ├── ECR Service (ecrService.js)       │
│  └── Deployment Service (deploymentService.js)
├─────────────────────────────────────────┤
│     AWS SDK v3 Clients                 │
│  ├── EC2Client                         │
│  ├── S3Client                          │
│  └── ECRClient                         │
└─────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1  # or your preferred region

# MongoDB (existing)
MONGODB_URI=mongodb://...
JWT_SECRET=...
```

### Never hardcode credentials. Always use environment variables.

## Services

### EC2 Service (`services/aws/ec2Service.js`)

Manages EC2 instances lifecycle.

**Methods:**
- `listInstances()` - List all running/stopped instances
- `getInstance(instanceId)` - Get single instance details
- `createInstance(config)` - Launch new instance
- `startInstance(instanceId)` - Start stopped instance
- `stopInstance(instanceId)` - Stop running instance
- `terminateInstance(instanceId)` - Terminate instance
- `getPublicIp(instanceId)` - Get public IP address
- `getInstanceStatus(instanceId)` - Get health status
- `listSecurityGroups()` - List available security groups

**Example:**
```javascript
const ec2Service = require('./services/aws/ec2Service');

// Create instance
const instance = await ec2Service.createInstance({
  amiId: 'ami-0c94855ba95c574c8',  // Ubuntu 20.04 AMI
  instanceType: 't3.micro',         // Instance type
  keyName: 'my-key-pair',          // EC2 Key Pair
  securityGroupIds: ['sg-12345678'], // Security groups
  tagName: 'My-App',               // Name tag
  tagEnvironment: 'production'     // Environment tag
});

console.log(instance.instanceId);    // i-1234567890abcdef0
console.log(instance.publicIp);      // 54.123.45.67
```

### S3 Service (`services/aws/s3Service.js`)

Manages S3 bucket operations and file uploads/downloads.

**Methods:**
- `listBuckets()` - List all buckets
- `listObjects(bucketName, options)` - List objects in bucket
- `uploadObject(bucketName, key, body, metadata)` - Upload file
- `downloadObject(bucketName, key)` - Download file
- `deleteObject(bucketName, key)` - Delete file
- `getPresignedUrl(bucketName, key, expiresIn)` - Generate signed URL
- `bucketExists(bucketName)` - Check bucket existence
- `createBucket(bucketName, options)` - Create new bucket

**Example:**
```javascript
const s3Service = require('./services/aws/s3Service');

// Upload deployment artifact
await s3Service.uploadObject(
  'my-deployments',
  'app-v1.0.tar.gz',
  fs.readFileSync('app.tar.gz'),
  { environment: 'production' }
);

// Generate presigned URL for download
const { url, expiresAt } = await s3Service.getPresignedUrl(
  'my-deployments',
  'app-v1.0.tar.gz',
  3600  // 1 hour expiration
);
```

### ECR Service (`services/aws/ecrService.js`)

Manages Docker image repositories and pushing/pulling.

**Methods:**
- `listRepositories()` - List all ECR repositories
- `createRepository(name, options)` - Create new repository
- `deleteRepository(name, options)` - Delete repository
- `getAuthorizationToken()` - Get token for docker login
- `listImages(repositoryName)` - List images in repo
- `describeImage(repositoryName, tag)` - Get image details
- `deleteImage(repositoryName, tag)` - Delete image
- `getRepositoryUri(repositoryName)` - Get push/pull commands

**Example:**
```javascript
const ecrService = require('./services/aws/ecrService');

// Create ECR repository
const repo = await ecrService.createRepository('my-app', {
  tagMutability: 'MUTABLE',
  imageScanOnPush: true
});

// Get auth token for docker login
const { authorizationToken, proxyEndpoint } = await ecrService.getAuthorizationToken();

// Get repository URI with docker commands
const { repositoryUri, dockerLoginCommand, pushCommand } = 
  await ecrService.getRepositoryUri('my-app');
```

### Deployment Service (`services/aws/deploymentService.js`)

Orchestrates complete application deployments.

**Methods:**
- `deployApplication(config)` - Full deployment workflow
- `terminateDeployment(config)` - Cleanup resources
- `getDeploymentStatus(instanceId)` - Get deployment status
- `listDeployments()` - List all CloudOps deployments
- `verifyAwsConnectivity()` - Test AWS access

**Example:**
```javascript
const deploymentService = require('./services/aws/deploymentService');

// Deploy application
const deployment = await deploymentService.deployApplication({
  applicationName: 'my-app',
  dockerImageUri: '123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest',
  instanceType: 't3.small',
  amiId: 'ami-0c94855ba95c574c8',
  keyName: 'my-key-pair',
  securityGroupIds: ['sg-12345678'],
  environmentVariables: {
    NODE_ENV: 'production',
    API_KEY: 'secret-key'
  }
});

console.log(deployment.deployment.publicIp);  // Access your app
```

## REST API Endpoints

### Health & Status

```
GET /api/aws/health
Response: { verified: true, ec2Available: true, ... }
```

### EC2 Instance Management

```bash
# List instances
GET /api/aws/ec2

# Get instance details
GET /api/aws/ec2/:instanceId

# Get instance status
GET /api/aws/ec2/:instanceId/status

# Get public IP
GET /api/aws/ec2/:instanceId/ip

# Create instance
POST /api/aws/ec2/create
Body: {
  "amiId": "ami-...",
  "instanceType": "t3.micro",
  "keyName": "my-key-pair",
  "securityGroupIds": ["sg-..."],
  "tagName": "My-App",
  "tagEnvironment": "production"
}

# Start instance
POST /api/aws/ec2/start/:instanceId

# Stop instance
POST /api/aws/ec2/stop/:instanceId

# Terminate instance
DELETE /api/aws/ec2/:instanceId
```

### S3 Bucket Operations

```bash
# List buckets
GET /api/aws/s3/buckets

# List objects in bucket
GET /api/aws/s3/:bucketName/objects?prefix=&maxKeys=100

# Get presigned download URL
GET /api/aws/s3/:bucketName/presigned-url?key=file.tar.gz&expiresIn=3600
```

### ECR Repository Management

```bash
# List repositories
GET /api/aws/ecr/repositories

# Create repository
POST /api/aws/ecr/repositories
Body: {
  "repositoryName": "my-app",
  "tagMutability": "MUTABLE",
  "imageScanOnPush": true
}

# Get auth token
GET /api/aws/ecr/auth-token
```

### Deployment Management

```bash
# Deploy application
POST /api/aws/deployments
Body: {
  "applicationName": "my-app",
  "amiId": "ami-...",
  "keyName": "my-key-pair",
  "instanceType": "t3.micro",
  "dockerImageUri": "123456789.dkr.ecr.region.amazonaws.com/my-app:latest",
  "securityGroupIds": ["sg-..."],
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}

# List deployments
GET /api/aws/deployments

# Get deployment status
GET /api/aws/deployments/:instanceId

# Terminate deployment
DELETE /api/aws/deployments/:instanceId
Body: {
  "bucketName": "cloudops-...",
  "repositoryName": "my-app",
  "cleanupS3": false,
  "cleanupECR": false
}
```

## Error Handling

All endpoints return consistent JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "errors": ["Field1 is required", "Field2 must be valid"]
}
```

## Security Best Practices

1. **Never commit credentials** - Use `.env` files and `.gitignore`
2. **Use IAM policies** - Restrict AWS credentials to minimum required permissions
3. **Enable logging** - All operations are logged with timestamps
4. **Authenticate requests** - All AWS routes require JWT authentication
5. **Validate inputs** - All parameters are validated before AWS calls
6. **Use HTTPS** - In production, always use HTTPS
7. **Rotate credentials** - Regularly rotate AWS access keys

## Sample AWS IAM Policy

Grant minimal permissions to CloudOps application:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:RunInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeSecurityGroups"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:CreateBucket"
      ],
      "Resource": ["arn:aws:s3:::cloudops-*", "arn:aws:s3:::cloudops-*/*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:DescribeRepositories",
        "ecr:CreateRepository",
        "ecr:DeleteRepository",
        "ecr:GetAuthorizationToken",
        "ecr:ListImages",
        "ecr:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
```

## Future Enhancements

1. **ECS Support** - Containerized deployments with Fargate
2. **Load Balancing** - Auto Scaling Groups with ALB/NLB
3. **RDS Integration** - Database provisioning
4. **CloudFront** - CDN distribution
5. **Lambda** - Serverless function deployment
6. **Monitoring** - CloudWatch integration
7. **Cost Tracking** - Budget alerts and usage analytics

## Troubleshooting

### "AWS credentials not configured"
- Check `.env` file has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Verify credentials are correct from AWS IAM console
- Ensure AWS region is set

### "UnauthorizedOperation"
- Check IAM user has required permissions
- Verify credentials are not expired
- Check AWS API rate limits

### "Instance launch timeout"
- Check EC2 capacity in the region
- Verify security group rules allow SSH (port 22)
- Check VPC and subnet configuration

### "Permission denied on S3 bucket"
- Verify bucket name is globally unique
- Check bucket creation region matches AWS_REGION
- Verify IAM policy includes S3 permissions

## Testing

```bash
# Test AWS connectivity
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/aws/health

# Create test instance
curl -X POST http://localhost:5000/api/aws/ec2/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amiId": "ami-0c94855ba95c574c8",
    "instanceType": "t3.micro",
    "keyName": "your-key-pair"
  }'
```

## References

- [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [ECR Documentation](https://docs.aws.amazon.com/ecr/)
