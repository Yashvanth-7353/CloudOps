/**
 * AWS Integration Examples & Test Cases
 * Demonstrates how to use the CloudOps AWS integration layer
 */

// ============== SETUP ==============
// These examples assume you have:
// 1. Express server running on http://localhost:5000
// 2. JWT token from authentication endpoint
// 3. AWS credentials configured in .env

const axios = require('axios');

// Base configuration
const API_BASE_URL = 'http://localhost:5000/api/aws';
const JWT_TOKEN = 'your_jwt_token_from_login';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============== UTILITY FUNCTIONS ==============

/**
 * Pretty print API responses
 */
function printResponse(label, response) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${label}`);
  console.log(`${'='.repeat(60)}`);
  console.log(JSON.stringify(response.data, null, 2));
}

/**
 * Handle errors
 */
function handleError(label, error) {
  console.error(`\n❌ ${label} failed:`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Error: ${error.response.data?.error || 'Unknown error'}`);
  } else {
    console.error(error.message);
  }
}

// ============== EXAMPLE 1: VERIFY AWS CONNECTIVITY ==============

async function example1_VerifyAWSConnectivity() {
  console.log('\n🔍 EXAMPLE 1: Verify AWS Connectivity');
  try {
    const response = await apiClient.get('/health');
    printResponse('AWS Health Check', response);
  } catch (error) {
    handleError('AWS Health Check', error);
  }
}

// ============== EXAMPLE 2: LIST EC2 INSTANCES ==============

async function example2_ListEC2Instances() {
  console.log('\n🔍 EXAMPLE 2: List EC2 Instances');
  try {
    const response = await apiClient.get('/ec2');
    printResponse('EC2 Instances List', response);
    
    // Extract instance IDs for later use
    const instanceIds = response.data.data.map(i => i.instanceId);
    console.log(`\n📌 Available Instance IDs: ${instanceIds.join(', ')}`);
    
    return instanceIds;
  } catch (error) {
    handleError('List EC2 Instances', error);
  }
}

// ============== EXAMPLE 3: GET SINGLE INSTANCE DETAILS ==============

async function example3_GetInstanceDetails(instanceId) {
  console.log('\n🔍 EXAMPLE 3: Get Single Instance Details');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    const response = await apiClient.get(`/ec2/${instanceId}`);
    printResponse(`Instance Details (${instanceId})`, response);
  } catch (error) {
    handleError('Get Instance Details', error);
  }
}

// ============== EXAMPLE 4: CREATE EC2 INSTANCE ==============

async function example4_CreateEC2Instance() {
  console.log('\n🔍 EXAMPLE 4: Create EC2 Instance');
  
  try {
    // Configuration for new instance
    const instanceConfig = {
      amiId: 'ami-0c94855ba95c574c8',  // Ubuntu 20.04 LTS in us-east-1
      instanceType: 't3.micro',         // Free tier eligible
      keyName: 'my-cloudops-key',      // Your EC2 Key Pair name
      securityGroupIds: ['sg-12345678'], // Your security group ID
      tagName: 'CloudOps-Test-Instance',
      tagEnvironment: 'development',
    };

    console.log('Creating instance with config:');
    console.log(JSON.stringify(instanceConfig, null, 2));

    const response = await apiClient.post('/ec2/create', instanceConfig);
    printResponse('Instance Creation Response', response);
    
    return response.data.data.instanceId;
  } catch (error) {
    handleError('Create EC2 Instance', error);
  }
}

// ============== EXAMPLE 5: GET INSTANCE PUBLIC IP ==============

async function example5_GetPublicIP(instanceId) {
  console.log('\n🔍 EXAMPLE 5: Get Instance Public IP');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    const response = await apiClient.get(`/ec2/${instanceId}/ip`);
    printResponse('Instance Public IP', response);
  } catch (error) {
    handleError('Get Public IP', error);
  }
}

// ============== EXAMPLE 6: START/STOP INSTANCE ==============

async function example6_StartStopInstance(instanceId) {
  console.log('\n🔍 EXAMPLE 6: Start/Stop Instance');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    // Stop instance
    console.log(`\n⏹️  Stopping instance ${instanceId}...`);
    let response = await apiClient.post(`/ec2/stop/${instanceId}`);
    printResponse('Stop Instance Response', response);

    // Wait 5 seconds
    console.log('\n⏳ Waiting 5 seconds before restarting...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start instance
    console.log(`\n▶️  Starting instance ${instanceId}...`);
    response = await apiClient.post(`/ec2/start/${instanceId}`);
    printResponse('Start Instance Response', response);
  } catch (error) {
    handleError('Start/Stop Instance', error);
  }
}

// ============== EXAMPLE 7: GET INSTANCE STATUS ==============

async function example7_GetInstanceStatus(instanceId) {
  console.log('\n🔍 EXAMPLE 7: Get Instance Status');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    const response = await apiClient.get(`/ec2/${instanceId}/status`);
    printResponse('Instance Status', response);
  } catch (error) {
    handleError('Get Instance Status', error);
  }
}

// ============== EXAMPLE 8: LIST S3 BUCKETS ==============

async function example8_ListS3Buckets() {
  console.log('\n🔍 EXAMPLE 8: List S3 Buckets');
  try {
    const response = await apiClient.get('/s3/buckets');
    printResponse('S3 Buckets', response);
  } catch (error) {
    handleError('List S3 Buckets', error);
  }
}

// ============== EXAMPLE 9: LIST ECR REPOSITORIES ==============

async function example9_ListECRRepositories() {
  console.log('\n🔍 EXAMPLE 9: List ECR Repositories');
  try {
    const response = await apiClient.get('/ecr/repositories');
    printResponse('ECR Repositories', response);
  } catch (error) {
    handleError('List ECR Repositories', error);
  }
}

// ============== EXAMPLE 10: CREATE ECR REPOSITORY ==============

async function example10_CreateECRRepository() {
  console.log('\n🔍 EXAMPLE 10: Create ECR Repository');
  try {
    const repoConfig = {
      repositoryName: 'cloudops-test-app',
      tagMutability: 'MUTABLE',
      imageScanOnPush: true,
    };

    const response = await apiClient.post('/ecr/repositories', repoConfig);
    printResponse('ECR Repository Created', response);
  } catch (error) {
    handleError('Create ECR Repository', error);
  }
}

// ============== EXAMPLE 11: GET ECR AUTH TOKEN ==============

async function example11_GetECRAuthToken() {
  console.log('\n🔍 EXAMPLE 11: Get ECR Authorization Token');
  try {
    const response = await apiClient.get('/ecr/auth-token');
    printResponse('ECR Auth Token', response);
    
    console.log('\n💡 Use this token to login to ECR:');
    console.log('docker login -u AWS -p <authorizationToken> <proxyEndpoint>');
  } catch (error) {
    handleError('Get ECR Auth Token', error);
  }
}

// ============== EXAMPLE 12: FULL APPLICATION DEPLOYMENT ==============

async function example12_DeployApplication() {
  console.log('\n🔍 EXAMPLE 12: Full Application Deployment');
  try {
    const deploymentConfig = {
      applicationName: 'my-nodejs-app',
      amiId: 'ami-0c94855ba95c574c8',  // Ubuntu 20.04 LTS
      instanceType: 't3.micro',
      keyName: 'my-cloudops-key',
      securityGroupIds: ['sg-12345678'],
      dockerImageUri: '123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '3000',
        LOG_LEVEL: 'info',
      },
    };

    console.log('Deploying application with config:');
    console.log(JSON.stringify(deploymentConfig, null, 2));

    const response = await apiClient.post('/deployments', deploymentConfig);
    printResponse('Deployment Initiated', response);
    
    // Extract deployment details
    const { instanceId, publicIp, ecrUri } = response.data.data.deployment;
    console.log(`\n📍 Access your app at: http://${publicIp}:3000`);
    console.log(`📦 Docker image URI: ${ecrUri}`);
    
    return instanceId;
  } catch (error) {
    handleError('Deploy Application', error);
  }
}

// ============== EXAMPLE 13: LIST ALL DEPLOYMENTS ==============

async function example13_ListDeployments() {
  console.log('\n🔍 EXAMPLE 13: List All Deployments');
  try {
    const response = await apiClient.get('/deployments');
    printResponse('All Deployments', response);
  } catch (error) {
    handleError('List Deployments', error);
  }
}

// ============== EXAMPLE 14: GET DEPLOYMENT STATUS ==============

async function example14_GetDeploymentStatus(instanceId) {
  console.log('\n🔍 EXAMPLE 14: Get Deployment Status');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    const response = await apiClient.get(`/deployments/${instanceId}`);
    printResponse('Deployment Status', response);
  } catch (error) {
    handleError('Get Deployment Status', error);
  }
}

// ============== EXAMPLE 15: TERMINATE DEPLOYMENT ==============

async function example15_TerminateDeployment(instanceId) {
  console.log('\n🔍 EXAMPLE 15: Terminate Deployment');
  if (!instanceId) {
    console.log('⚠️  Skipping - no instance ID provided');
    return;
  }
  
  try {
    const response = await apiClient.delete(`/deployments/${instanceId}`, {
      data: {
        bucketName: 'cloudops-my-nodejs-app-1234567890',
        repositoryName: 'my-nodejs-app',
        cleanupS3: false,  // Set to true to delete S3 bucket
        cleanupECR: false, // Set to true to delete ECR repo
      },
    });
    printResponse('Deployment Termination Initiated', response);
  } catch (error) {
    handleError('Terminate Deployment', error);
  }
}

// ============== MAIN EXECUTION ==============

async function runAllExamples() {
  console.log('🚀 CloudOps AWS Integration Examples');
  console.log('=====================================\n');

  try {
    // 1. Verify connectivity
    await example1_VerifyAWSConnectivity();

    // 2. List existing instances
    const instanceIds = await example2_ListEC2Instances();
    
    if (instanceIds && instanceIds.length > 0) {
      // 3. Get details of first instance
      await example3_GetInstanceDetails(instanceIds[0]);
      
      // 5. Get public IP
      await example5_GetPublicIP(instanceIds[0]);
      
      // 7. Get instance status
      await example7_GetInstanceStatus(instanceIds[0]);
    }

    // 8. List S3 buckets
    await example8_ListS3Buckets();

    // 9. List ECR repositories
    await example9_ListECRRepositories();

    // 11. Get ECR auth token
    await example11_GetECRAuthToken();

    // 13. List all deployments
    await example13_ListDeployments();

    // OPTIONAL: Create new instance (uncomment to run)
    // const newInstanceId = await example4_CreateEC2Instance();

    // OPTIONAL: Create ECR repository (uncomment to run)
    // await example10_CreateECRRepository();

    // OPTIONAL: Deploy full application (uncomment to run)
    // const deploymentInstanceId = await example12_DeployApplication();
    // await example14_GetDeploymentStatus(deploymentInstanceId);

    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// ============== EXPORTS FOR MODULE USE ==============

module.exports = {
  apiClient,
  example1_VerifyAWSConnectivity,
  example2_ListEC2Instances,
  example3_GetInstanceDetails,
  example4_CreateEC2Instance,
  example5_GetPublicIP,
  example6_StartStopInstance,
  example7_GetInstanceStatus,
  example8_ListS3Buckets,
  example9_ListECRRepositories,
  example10_CreateECRRepository,
  example11_GetECRAuthToken,
  example12_DeployApplication,
  example13_ListDeployments,
  example14_GetDeploymentStatus,
  example15_TerminateDeployment,
  runAllExamples,
};

// ============== RUN IF EXECUTED DIRECTLY ==============

if (require.main === module) {
  runAllExamples();
}
