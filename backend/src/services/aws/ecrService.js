/**
 * ECR Service - AWS Elastic Container Registry
 * Handles ECR operations: list repos, create repo, push/pull images
 * Uses AWS SDK v3
 */

const {
  ECRClient,
  DescribeRepositoriesCommand,
  CreateRepositoryCommand,
  DeleteRepositoryCommand,
  GetAuthorizationTokenCommand,
  DescribeImageCommand,
  ListImagesCommand,
  DeleteImageCommand,
} = require('@aws-sdk/client-ecr');

// Configure ECR Client
const ecrClient = new ECRClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class ECRService {
  /**
   * List all ECR repositories
   * @returns {Promise<Array>} Array of repositories
   */
  async listRepositories() {
    try {
      const command = new DescribeRepositoriesCommand({});
      const response = await ecrClient.send(command);

      return response.repositories.map((repo) => ({
        repositoryArn: repo.repositoryArn,
        repositoryUri: repo.repositoryUri,
        repositoryName: repo.repositoryName,
        createdAt: repo.createdAt,
        imageScanningConfiguration: repo.imageScanningConfiguration,
        encryptionConfiguration: repo.encryptionConfiguration,
      }));
    } catch (error) {
      throw new Error(`Failed to list ECR repositories: ${error.message}`);
    }
  }

  /**
   * Create a new ECR repository
   * @param {string} repositoryName - Repository name
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} Created repository details
   */
  async createRepository(repositoryName, options = {}) {
    try {
      const {
        tagMutability = 'MUTABLE',
        imageScanOnPush = true,
      } = options;

      const params = {
        repositoryName,
        imageScanningConfiguration: {
          scanOnPush: imageScanOnPush,
        },
        tagMutability,
      };

      const command = new CreateRepositoryCommand(params);
      const response = await ecrClient.send(command);

      return {
        repositoryArn: response.repository.repositoryArn,
        repositoryUri: response.repository.repositoryUri,
        repositoryName: response.repository.repositoryName,
        createdAt: response.repository.createdAt,
        message: 'Repository created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create ECR repository: ${error.message}`);
    }
  }

  /**
   * Delete an ECR repository
   * @param {string} repositoryName - Repository name
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRepository(repositoryName, options = {}) {
    try {
      const { force = false } = options;

      const params = {
        repositoryName,
        force,
      };

      const command = new DeleteRepositoryCommand(params);
      const response = await ecrClient.send(command);

      return {
        repositoryArn: response.repository.repositoryArn,
        repositoryName: response.repository.repositoryName,
        message: 'Repository deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete ECR repository: ${error.message}`);
    }
  }

  /**
   * Get ECR authorization token for pushing/pulling images
   * @returns {Promise<Object>} Authorization token details
   */
  async getAuthorizationToken() {
    try {
      const command = new GetAuthorizationTokenCommand({});
      const response = await ecrClient.send(command);

      const authData = response.authorizationData[0];

      return {
        authorizationToken: authData.authorizationToken,
        proxyEndpoint: authData.proxyEndpoint,
        expiresAt: authData.expiresAt,
        message: 'Authorization token retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get ECR authorization token: ${error.message}`);
    }
  }

  /**
   * List images in a repository
   * @param {string} repositoryName - Repository name
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array>} Array of images
   */
  async listImages(repositoryName, options = {}) {
    try {
      const { maxResults = 100 } = options;

      const params = {
        repositoryName,
        maxResults,
      };

      const command = new ListImagesCommand(params);
      const response = await ecrClient.send(command);

      return response.imageIds.map((image) => ({
        imageTag: image.imageTag,
        imageDigest: image.imageDigest,
      }));
    } catch (error) {
      throw new Error(`Failed to list images in repository ${repositoryName}: ${error.message}`);
    }
  }

  /**
   * Describe an image in a repository
   * @param {string} repositoryName - Repository name
   * @param {string} imageTag - Image tag or digest
   * @returns {Promise<Object>} Image details
   */
  async describeImage(repositoryName, imageTag) {
    try {
      const params = {
        repositoryName,
        imageIds: [
          {
            imageTag,
          },
        ],
      };

      const command = new DescribeImageCommand(params);
      const response = await ecrClient.send(command);

      if (!response.imageDetails.length) {
        throw new Error('Image not found');
      }

      const image = response.imageDetails[0];

      return {
        imageTag: image.imageTags ? image.imageTags[0] : null,
        imageDigest: image.imageDigest,
        imageSizeInBytes: image.imageSizeInBytes,
        imagePushedAt: image.imagePushedAt,
        imageScanStatus: image.imageScanStatus,
        vulnerabilitySummary: image.imageScanFindingsSummary?.findingSeverityCounts,
      };
    } catch (error) {
      throw new Error(`Failed to describe image in ${repositoryName}: ${error.message}`);
    }
  }

  /**
   * Delete an image from a repository
   * @param {string} repositoryName - Repository name
   * @param {string} imageTag - Image tag
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(repositoryName, imageTag) {
    try {
      const params = {
        repositoryName,
        imageIds: [
          {
            imageTag,
          },
        ],
      };

      const command = new DeleteImageCommand(params);
      const response = await ecrClient.send(command);

      return {
        imageTag,
        repositoryName,
        message: 'Image deleted successfully',
        deletedImages: response.imageIds.length,
      };
    } catch (error) {
      throw new Error(`Failed to delete image from ${repositoryName}: ${error.message}`);
    }
  }

  /**
   * Get ECR repository URI for Docker operations
   * @param {string} repositoryName - Repository name
   * @returns {Promise<Object>} Repository URI and push commands
   */
  async getRepositoryUri(repositoryName) {
    try {
      const repos = await this.listRepositories();
      const repo = repos.find((r) => r.repositoryName === repositoryName);

      if (!repo) {
        throw new Error('Repository not found');
      }

      const authToken = await this.getAuthorizationToken();

      return {
        repositoryUri: repo.repositoryUri,
        authToken: authToken.authorizationToken,
        dockerLoginCommand: `aws ecr get-login-password --region ${process.env.AWS_REGION || 'us-east-1'} | docker login --username AWS --password-stdin ${repo.repositoryUri}`,
        pushCommand: `docker tag <image-name>:latest ${repo.repositoryUri}:latest && docker push ${repo.repositoryUri}:latest`,
      };
    } catch (error) {
      throw new Error(`Failed to get repository URI: ${error.message}`);
    }
  }

  /**
   * Generate Docker login command from authorization token
   * Works on Windows by properly encoding credentials for PowerShell
   * @param {Object} authTokenData - Authorization token data from getAuthorizationToken()
   * @returns {string} Docker login command
   */
  getLoginCommand(authTokenData) {
    try {
      const { authorizationToken, proxyEndpoint } = authTokenData;

      if (!authorizationToken || !proxyEndpoint) {
        throw new Error('Invalid authorization token data');
      }

      // Extract username and password from authorization token
      // authorizationToken is base64 encoded "AWS:<password>"
      const decoded = Buffer.from(authorizationToken, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');

      if (!username || !password) {
        throw new Error('Failed to decode authorization token');
      }

      // Extract registry URL from proxyEndpoint
      const registryUrl = proxyEndpoint.replace(/^https?:\/\//, '');

      // For Windows: Use PowerShell to handle special characters in password
      // ConvertTo-SecureString with -AsPlainText pipes to docker login
      const loginCommand = `powershell -Command "Write-Host -NoNewline '${password}' | docker login --username ${username} --password-stdin ${registryUrl}"`;

      return loginCommand;
    } catch (error) {
      throw new Error(`Failed to generate login command: ${error.message}`);
    }
  }
}

module.exports = new ECRService();
