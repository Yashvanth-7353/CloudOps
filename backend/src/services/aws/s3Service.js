/**
 * S3 Service - AWS S3 Bucket Management
 * Handles S3 operations: upload, download, list, delete objects
 * Uses AWS SDK v3
 */

const {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class S3Service {
  /**
   * List all S3 buckets
   * @returns {Promise<Array>} Array of bucket names and creation dates
   */
  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);

      return response.Buckets.map((bucket) => ({
        name: bucket.Name,
        createdAt: bucket.CreationDate,
      }));
    } catch (error) {
      throw new Error(`Failed to list S3 buckets: ${error.message}`);
    }
  }

  /**
   * List objects in a bucket
   * @param {string} bucketName - S3 Bucket name
   * @param {Object} options - Optional parameters (prefix, maxKeys)
   * @returns {Promise<Array>} Array of objects in bucket
   */
  async listObjects(bucketName, options = {}) {
    try {
      const { prefix = '', maxKeys = 100 } = options;

      const params = {
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      };

      const command = new ListObjectsV2Command(params);
      const response = await s3Client.send(command);

      return (response.Contents || []).map((obj) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        storageClass: obj.StorageClass,
      }));
    } catch (error) {
      throw new Error(`Failed to list objects in bucket ${bucketName}: ${error.message}`);
    }
  }

  /**
   * Upload object to S3
   * @param {string} bucketName - S3 Bucket name
   * @param {string} key - Object key
   * @param {Buffer|string} body - Object content
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadObject(bucketName, key, body, metadata = {}) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: body,
        Metadata: metadata,
      };

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      return {
        bucketName,
        key,
        etag: response.ETag,
        message: 'Object uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to upload object to S3: ${error.message}`);
    }
  }

  /**
   * Download object from S3
   * @param {string} bucketName - S3 Bucket name
   * @param {string} key - Object key
   * @returns {Promise<Buffer>} Object content
   */
  async downloadObject(bucketName, key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);

      return {
        body: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch (error) {
      throw new Error(`Failed to download object from S3: ${error.message}`);
    }
  }

  /**
   * Delete object from S3
   * @param {string} bucketName - S3 Bucket name
   * @param {string} key - Object key
   * @returns {Promise<Object>} Deletion result
   */
  async deleteObject(bucketName, key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      const response = await s3Client.send(command);

      return {
        bucketName,
        key,
        deleteMarker: response.DeleteMarker,
        message: 'Object deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete object from S3: ${error.message}`);
    }
  }

  /**
   * Create presigned URL for object download
   * @param {string} bucketName - S3 Bucket name
   * @param {string} key - Object key
   * @param {number} expiresIn - URL expiration in seconds (default 3600)
   * @returns {Promise<string>} Presigned URL
   */
  async getPresignedUrl(bucketName, key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        url,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Check if bucket exists
   * @param {string} bucketName - S3 Bucket name
   * @returns {Promise<boolean>} Bucket existence status
   */
  async bucketExists(bucketName) {
    try {
      const params = {
        Bucket: bucketName,
      };

      const command = new HeadBucketCommand(params);
      await s3Client.send(command);

      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw new Error(`Failed to check bucket existence: ${error.message}`);
    }
  }

  /**
   * Create S3 bucket
   * @param {string} bucketName - S3 Bucket name
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} Bucket creation result
   */
  async createBucket(bucketName, options = {}) {
    try {
      const params = {
        Bucket: bucketName,
      };

      // Add region if specified and not us-east-1
      if (options.region && options.region !== 'us-east-1') {
        params.CreateBucketConfiguration = {
          LocationConstraint: options.region,
        };
      }

      const command = new CreateBucketCommand(params);
      const response = await s3Client.send(command);

      return {
        bucketName,
        location: response.Location,
        message: 'Bucket created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create S3 bucket: ${error.message}`);
    }
  }
}

module.exports = new S3Service();
