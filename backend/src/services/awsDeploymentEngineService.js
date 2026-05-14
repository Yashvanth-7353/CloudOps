/**
 * AWS Deployment Engine Service
 * Handles Docker image push to ECR and EC2 instance deployment
 * Provides live logs and monitoring
 */

const fs = require('fs/promises');
const { exec, spawn } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const ecrService = require('./aws/ecrService');
const ec2Service = require('./aws/ec2Service');

class AWSDeploymentEngineService {
  constructor() {
    this.deploymentInProgress = new Map();
  }

  /**
   * Push Docker image to ECR
   */
  async pushImageToECR(deploymentId, imageName, deployment, io, emitLog) {
    try {
      emitLog(io, deployment, 'aws', 'info', 'Initializing ECR push...');

      // Get ECR authorization token
      const authToken = await ecrService.getAuthorizationToken();
      emitLog(io, deployment, 'aws', 'info', 'ECR authorization obtained');

      // Create or get repository
      const repositoryName = `cloudops-${deployment.repositoryName}`.toLowerCase().substring(0, 256);
      
      let repository;
      try {
        repository = await ecrService.createRepository(repositoryName);
        emitLog(io, deployment, 'aws', 'success', 'ECR repository created', {
          repositoryUri: repository.repositoryUri,
        });
      } catch (error) {
        if (error.message.includes('RepositoryAlreadyExistsException')) {
          const repos = await ecrService.listRepositories();
          repository = repos.find(r => r.repositoryName === repositoryName);
          emitLog(io, deployment, 'aws', 'info', 'Using existing ECR repository', {
            repositoryUri: repository.repositoryUri,
          });
        } else {
          throw error;
        }
      }

      const ecrUri = repository.repositoryUri;
      const imageTag = `${deploymentId}`;
      const fullImageUri = `${ecrUri}:${imageTag}`;

      emitLog(io, deployment, 'aws', 'info', 'Logging into ECR...', {
        registry: ecrUri.split('/')[0],
      });

      // Get ECR login credentials
      const { authorizationToken, proxyEndpoint } = authToken;
      const registryUrl = proxyEndpoint.replace(/^https?:\/\//, '');
      
      // Decode authorization token to get username and password
      const decoded = Buffer.from(authorizationToken, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');

      // Use spawn for proper stdin handling (works better with special characters on Windows)
      try {
        await new Promise((resolve, reject) => {
          const dockerLogin = spawn('docker', [
            'login',
            '--username',
            username,
            '--password-stdin',
            registryUrl,
          ]);

          let errorOutput = '';
          
          dockerLogin.stdout.on('data', (data) => {
            emitLog(io, deployment, 'aws', 'debug', data.toString().trim());
          });

          dockerLogin.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          dockerLogin.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Docker login failed with code ${code}: ${errorOutput}`));
            }
          });

          dockerLogin.on('error', (error) => {
            reject(new Error(`Failed to spawn docker login: ${error.message}`));
          });

          // Send password via stdin
          dockerLogin.stdin.write(password);
          dockerLogin.stdin.end();
        });

        emitLog(io, deployment, 'aws', 'success', 'Logged into ECR registry');
      } catch (error) {
        emitLog(io, deployment, 'aws', 'warn', 'ECR login warning', { message: error.message });
      }

      // Tag the image
      emitLog(io, deployment, 'aws', 'info', 'Tagging Docker image for ECR...');
      const tagCommand = `docker tag ${imageName}:latest ${fullImageUri}`;
      
      try {
        await execPromise(tagCommand);
        emitLog(io, deployment, 'aws', 'success', 'Docker image tagged', {
          sourceImage: `${imageName}:latest`,
          targetImage: fullImageUri,
        });
      } catch (error) {
        throw new Error(`Failed to tag image: ${error.message}`);
      }

      // Push the image to ECR
      emitLog(io, deployment, 'aws', 'info', 'Pushing Docker image to ECR...', {
        repository: repositoryName,
        imageUri: fullImageUri,
      });

      const pushCommand = `docker push ${fullImageUri}`;
      
      try {
        const { stdout, stderr } = await execPromise(pushCommand, { maxBuffer: 10 * 1024 * 1024 });
        
        if (stdout) {
          const lines = stdout.split('\n').filter(l => l.trim());
          lines.forEach(line => {
            emitLog(io, deployment, 'aws', 'debug', line.trim());
          });
        }
        
        emitLog(io, deployment, 'aws', 'success', 'Docker image pushed to ECR', {
          imageUri: fullImageUri,
        });
      } catch (error) {
        throw new Error(`Failed to push image to ECR: ${error.message}`);
      }

      return {
        ecrUri,
        imageUri: fullImageUri,
        repositoryName,
        imageTag,
      };
    } catch (error) {
      emitLog(io, deployment, 'aws', 'error', `ECR push failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Launch EC2 instance with Docker container
   */
  async launchEC2Instance(deploymentId, ecrImageUri, deployment, io, emitLog, options = {}) {
    try {
      const {
        instanceType = 't3.micro',
        keyName: userKeyName,
        securityGroupIds = [],
        vpcId,
        containerPort = 80,
      } = options;

      emitLog(io, deployment, 'aws', 'info', 'Preparing EC2 instance launch...', {
        instanceType,
      });

      // Get ECR authorization token for the instance
      emitLog(io, deployment, 'aws', 'info', 'Getting ECR authorization token for instance...');
      const authToken = await ecrService.getAuthorizationToken();
      const decoded = Buffer.from(authToken.authorizationToken, 'base64').toString('utf-8');
      const [, password] = decoded.split(':');

      // AUTO CREATE KEY PAIR if not provided
      let finalKeyName = userKeyName || process.env.AWS_EC2_KEY_NAME;
      if (!finalKeyName) {
        finalKeyName = `cloudops-${deploymentId}`;
        emitLog(io, deployment, 'aws', 'info', 'Auto-generating EC2 key pair...', {
          keyName: finalKeyName,
        });

        try {
          const keyPairResult = await ec2Service.createOrGetKeyPair(finalKeyName);
          emitLog(io, deployment, 'aws', 'success', `EC2 key pair ready: ${keyPairResult.message}`, {
            keyName: finalKeyName,
            created: keyPairResult.created,
          });
        } catch (keyError) {
          emitLog(io, deployment, 'aws', 'warn', `Key pair creation warning: ${keyError.message}`);
        }
      }

      // AUTO CREATE SECURITY GROUP if not provided
      let finalSecurityGroupIds = securityGroupIds;
      if (!finalSecurityGroupIds || finalSecurityGroupIds.length === 0) {
        const sgName = `cloudops-sg-${deploymentId.substring(0, 8)}`;
        const sgDescription = `CloudOps security group for deployment ${deploymentId}`;
        
        emitLog(io, deployment, 'aws', 'info', 'Auto-creating security group...', {
          sgName,
        });

        try {
          const sgResult = await ec2Service.createOrGetSecurityGroup(
            sgName,
            sgDescription,
            vpcId
          );
          finalSecurityGroupIds = [sgResult.groupId];
          emitLog(io, deployment, 'aws', 'success', `Security group ready: ${sgResult.message}`, {
            groupId: sgResult.groupId,
            created: sgResult.created,
          });
        } catch (sgError) {
          emitLog(io, deployment, 'aws', 'warn', `Security group creation warning: ${sgError.message}`);
        }
      }

      // Generate user data script for EC2
      const userDataScript = this.generateUserDataScript(ecrImageUri, containerPort, deployment, password);
      
      emitLog(io, deployment, 'aws', 'debug', 'EC2 user data script prepared');

      // Launch instance
      emitLog(io, deployment, 'aws', 'info', 'Launching EC2 instance...', {
        imageUri: ecrImageUri,
        containerPort,
        keyName: finalKeyName,
        securityGroupCount: finalSecurityGroupIds.length,
      });

      const instanceConfig = {
        instanceType: instanceType,
        keyName: finalKeyName,
        securityGroupIds: finalSecurityGroupIds,
        minCount: 1,
        maxCount: 1,
        subnetId: vpcId,
        tagName: `cloudops-${deployment.repositoryName}-${deploymentId}`.substring(0, 256),
        tagEnvironment: 'production',
        userData: userDataScript,
        deploymentId: deploymentId,
      };

      const instanceResponse = await ec2Service.createInstance(instanceConfig);
      const instanceId = instanceResponse.instanceId;

      emitLog(io, deployment, 'aws', 'success', 'EC2 instance launched', {
        instanceId,
      });

      // Wait for instance to be running
      emitLog(io, deployment, 'aws', 'info', 'Waiting for EC2 instance to start...', {
        instanceId,
      });

      let instance = await this.waitForInstanceRunning(instanceId, deployment, io, emitLog);

      emitLog(io, deployment, 'aws', 'success', 'EC2 instance is running', {
        instanceId,
        publicIp: instance.publicIp,
        privateIp: instance.privateIp,
      });

      // Wait for user data script to complete
      emitLog(io, deployment, 'aws', 'info', 'Waiting for Docker container to start...', {
        timeoutSeconds: 120,
      });

      await this.wait(30000); // Give Docker time to start

      // Verify container is running
      const publicIp = instance.publicIp;
      const privateIp = instance.privateIp;

      if (!publicIp) {
        throw new Error('EC2 instance created but public IP address is unavailable');
      }

      const containerUrl = `http://${publicIp}:${containerPort}`;
      let containerResponding = false;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const response = await this.checkEndpoint(containerUrl);
          if (response.status === 200 || response.status === 301) {
            emitLog(io, deployment, 'aws', 'success', 'Container is responding', {
              url: containerUrl,
              statusCode: response.status,
            });
            containerResponding = true;
            break;
          }
        } catch (error) {
          if (attempt < 9) {
            emitLog(io, deployment, 'aws', 'debug', `Waiting for container to respond (attempt ${attempt + 1}/10)...`);
            // eslint-disable-next-line no-await-in-loop
            await this.wait(10000);
          }
        }
      }

      if (!containerResponding) {
        throw new Error(`Container did not respond at ${containerUrl} after 10 attempts`);
      }

      return {
        instanceId,
        publicIp,
        privateIp,
        containerUrl,
        liveUrl: containerUrl,
      };
    } catch (error) {
      emitLog(io, deployment, 'aws', 'error', `EC2 launch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for EC2 instance to be in running state
   */
  async waitForInstanceRunning(instanceId, deployment, io, emitLog, maxWaitTime = 300000) {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const instances = await ec2Service.describeInstances([instanceId]);
        
        if (instances.length > 0) {
          const instance = instances[0];
          
          if (instance.state === 'running') {
            return instance;
          }
          
          emitLog(io, deployment, 'aws', 'debug', `Instance state: ${instance.state}`);
        }

        // eslint-disable-next-line no-await-in-loop
        await this.wait(pollInterval);
      } catch (error) {
        emitLog(io, deployment, 'aws', 'warn', `Error checking instance state: ${error.message}`);
        // eslint-disable-next-line no-await-in-loop
        await this.wait(pollInterval);
      }
    }

    throw new Error(`Instance ${instanceId} did not reach running state within ${maxWaitTime / 1000} seconds`);
  }

  /**
   * Generate EC2 user data script for Docker
   */
  generateUserDataScript(ecrImageUri, containerPort, deployment, ecrAuthToken) {
    const script = `#!/bin/bash

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting CloudOps deployment..."
echo "Timestamp: $(date)"

echo "Updating system..."
yum update -y

echo "Installing Docker..."
amazon-linux-extras enable docker
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -a -G docker ec2-user
chmod 666 /var/run/docker.sock

echo "Docker version: $(docker --version)"

echo "Installing AWS CLI v2..."
yum install -y unzip python3 curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
unzip -o /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
aws --version

echo "Logging into ECR..."
echo "${ecrAuthToken}" | docker login --username AWS --password-stdin ${ecrImageUri.split('/')[0]}
if [ $? -ne 0 ]; then
  echo "ERROR: ECR login failed"
  exit 1
fi
echo "ECR login successful"

echo "Pulling Docker image..."
docker pull ${ecrImageUri}
if [ $? -ne 0 ]; then
  echo "ERROR: Docker pull failed"
  exit 1
fi
echo "Docker image pulled successfully"

echo "Starting Docker container..."
docker run -d \\
  --name cloudops-container \\
  -p ${containerPort}:${containerPort} \\
  -e DEPLOYMENT_ID=${deployment._id} \\
  -e REPOSITORY_NAME=${deployment.repositoryName} \\
  --restart unless-stopped \\
  ${ecrImageUri}
if [ $? -ne 0 ]; then
  echo "ERROR: Docker run failed"
  exit 1
fi

echo "Container started successfully"
docker ps -a

echo "Deployment completed at $(date)" > /var/lib/cloudops-deployment.txt
`;

    return script;
  }

  /**
   * Helper to wait
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if endpoint is responding
   */
  async checkEndpoint(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? require('https') : require('http');
      
      protocol.get(url, (response) => {
        resolve({ status: response.statusCode });
      }).on('error', (error) => {
        reject(error);
      }).setTimeout(5000);
    });
  }
}

module.exports = new AWSDeploymentEngineService();
