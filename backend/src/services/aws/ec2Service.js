/**
 * EC2 Service - AWS EC2 Instance Management
 * Handles EC2 operations: list, create, start, stop, terminate instances
 * Uses AWS SDK v3
 */

const {
  EC2Client,
  DescribeInstancesCommand,
  RunInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstanceStatusCommand,
  DescribeSecurityGroupsCommand,
} = require('@aws-sdk/client-ec2');

// Configure EC2 Client
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class EC2Service {
  /**
   * List all EC2 instances
   * @param {Object} filters - Optional filters for instance state
   * @returns {Promise<Array>} Array of instance details
   */
  async listInstances(filters = []) {
    try {
      const params = {
        Filters: [
          {
            Name: 'instance-state-name',
            Values: ['running', 'stopped', 'pending'],
          },
          ...filters,
        ],
      };

      const command = new DescribeInstancesCommand(params);
      const response = await ec2Client.send(command);

      return (response.Reservations || []).flatMap((reservation) =>
        (reservation.Instances || []).map((instance) => ({
          instanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          state: instance.State.Name,
          launchTime: instance.LaunchTime,
          publicIp: instance.PublicIpAddress || null,
          privateIp: instance.PrivateIpAddress,
          keyName: instance.KeyName,
          securityGroups: (instance.SecurityGroups || []).map((sg) => ({
            id: sg.GroupId,
            name: sg.GroupName,
          })),
          tags: instance.Tags ? this._tagsToObject(instance.Tags) : {},
          vpcId: instance.VpcId,
          subnetId: instance.SubnetId,
          imageId: instance.ImageId,
          architecture: instance.Architecture,
        }))
      );
    } catch (error) {
      throw new Error(`Failed to list EC2 instances: ${error.message}`);
    }
  }

  /**
   * Get a single instance by ID
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<Object>} Instance details
   */
  async getInstance(instanceId) {
    try {
      const params = {
        InstanceIds: [instanceId],
      };

      const command = new DescribeInstancesCommand(params);
      const response = await ec2Client.send(command);

      if (!response.Reservations.length || !response.Reservations[0].Instances.length) {
        throw new Error('Instance not found');
      }

      const instance = response.Reservations[0].Instances[0];

      return {
        instanceId: instance.InstanceId,
        instanceType: instance.InstanceType,
        state: instance.State.Name,
        launchTime: instance.LaunchTime,
        publicIp: instance.PublicIpAddress || null,
        privateIp: instance.PrivateIpAddress,
        keyName: instance.KeyName,
        securityGroups: instance.SecurityGroups.map((sg) => ({
          id: sg.GroupId,
          name: sg.GroupName,
        })),
        tags: instance.Tags ? this._tagsToObject(instance.Tags) : {},
        vpcId: instance.VpcId,
        subnetId: instance.SubnetId,
        imageId: instance.ImageId,
        cpuDetails: instance.CpuOptions,
        monitoring: instance.Monitoring?.State,
      };
    } catch (error) {
      throw new Error(`Failed to get instance ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Create a new EC2 instance
   * @param {Object} config - Instance configuration
   * @returns {Promise<Object>} Created instance details
   */
  async createInstance(config) {
    try {
      const {
        amiId,
        instanceType,
        keyName,
        securityGroupIds,
        minCount = 1,
        maxCount = 1,
        subnetId = undefined,
        tagName = 'CloudOps-Instance',
        tagEnvironment = 'development',
      } = config;

      // Validate required parameters
      if (!amiId || !instanceType) {
        throw new Error('AMI ID and instance type are required');
      }

      const params = {
        ImageId: amiId,
        InstanceType: instanceType,
        MinCount: minCount,
        MaxCount: maxCount,
        KeyName: keyName,
        SecurityGroupIds: securityGroupIds || [],
      };

      if (subnetId) {
        params.SubnetId = subnetId;
      }

      // Add tags
      params.TagSpecifications = [
        {
          ResourceType: 'instance',
          Tags: [
            {
              Key: 'Name',
              Value: tagName,
            },
            {
              Key: 'Environment',
              Value: tagEnvironment,
            },
            {
              Key: 'CreatedBy',
              Value: 'CloudOps',
            },
            {
              Key: 'CreatedAt',
              Value: new Date().toISOString(),
            },
          ],
        },
      ];

      const command = new RunInstancesCommand(params);
      const response = await ec2Client.send(command);

      const instance = response.Instances[0];

      return {
        instanceId: instance.InstanceId,
        instanceType: instance.InstanceType,
        state: instance.State.Name,
        publicIp: instance.PublicIpAddress || null,
        privateIp: instance.PrivateIpAddress,
        imageId: instance.ImageId,
        launchTime: instance.LaunchTime,
        tags: instance.Tags ? this._tagsToObject(instance.Tags) : {},
        message: 'Instance creation initiated',
      };
    } catch (error) {
      throw new Error(`Failed to create EC2 instance: ${error.message}`);
    }
  }

  /**
   * Start a stopped EC2 instance
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<Object>} Updated instance state
   */
  async startInstance(instanceId) {
    try {
      const params = {
        InstanceIds: [instanceId],
      };

      const command = new StartInstancesCommand(params);
      const response = await ec2Client.send(command);

      const instance = response.StartingInstances[0];

      return {
        instanceId: instance.InstanceId,
        previousState: instance.PreviousState.Name,
        currentState: instance.CurrentState.Name,
        message: 'Instance start command sent',
      };
    } catch (error) {
      throw new Error(`Failed to start instance ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Stop a running EC2 instance
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<Object>} Updated instance state
   */
  async stopInstance(instanceId) {
    try {
      const params = {
        InstanceIds: [instanceId],
      };

      const command = new StopInstancesCommand(params);
      const response = await ec2Client.send(command);

      const instance = response.StoppingInstances[0];

      return {
        instanceId: instance.InstanceId,
        previousState: instance.PreviousState.Name,
        currentState: instance.CurrentState.Name,
        message: 'Instance stop command sent',
      };
    } catch (error) {
      throw new Error(`Failed to stop instance ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Terminate an EC2 instance
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<Object>} Termination details
   */
  async terminateInstance(instanceId) {
    try {
      const params = {
        InstanceIds: [instanceId],
      };

      const command = new TerminateInstancesCommand(params);
      const response = await ec2Client.send(command);

      const instance = response.TerminatingInstances[0];

      return {
        instanceId: instance.InstanceId,
        previousState: instance.PreviousState.Name,
        currentState: instance.CurrentState.Name,
        message: 'Instance termination initiated',
      };
    } catch (error) {
      throw new Error(`Failed to terminate instance ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Get instance public IP
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<string>} Public IP address
   */
  async getPublicIp(instanceId) {
    try {
      const instance = await this.getInstance(instanceId);

      if (!instance.publicIp) {
        throw new Error('Instance does not have a public IP assigned');
      }

      return instance.publicIp;
    } catch (error) {
      throw new Error(`Failed to get public IP for instance ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Get instance status
   * @param {string} instanceId - EC2 Instance ID
   * @returns {Promise<Object>} Instance status details
   */
  async getInstanceStatus(instanceId) {
    try {
      const params = {
        InstanceIds: [instanceId],
      };

      const command = new DescribeInstanceStatusCommand(params);
      const response = await ec2Client.send(command);

      if (!response.InstanceStatuses.length) {
        throw new Error('Instance status not found');
      }

      const status = response.InstanceStatuses[0];

      return {
        instanceId: status.InstanceId,
        instanceState: status.InstanceState.Name,
        systemStatus: status.SystemStatus?.Status || 'unknown',
        instanceStatus: status.InstanceStatus?.Status || 'unknown',
        availabilityZone: status.AvailabilityZone,
      };
    } catch (error) {
      throw new Error(`Failed to get instance status for ${instanceId}: ${error.message}`);
    }
  }

  /**
   * List security groups
   * @returns {Promise<Array>} Array of security groups
   */
  async listSecurityGroups() {
    try {
      const command = new DescribeSecurityGroupsCommand({});
      const response = await ec2Client.send(command);

      return response.SecurityGroups.map((sg) => ({
        groupId: sg.GroupId,
        groupName: sg.GroupName,
        description: sg.Description,
        vpcId: sg.VpcId,
        inboundRules: sg.IpPermissions.length,
        outboundRules: sg.IpPermissionsEgress.length,
      }));
    } catch (error) {
      throw new Error(`Failed to list security groups: ${error.message}`);
    }
  }

  /**
   * Helper: Convert Tags array to object
   * @private
   */
  _tagsToObject(tags) {
    return (tags || []).reduce((tagObj, tag) => {
      tagObj[tag.Key] = tag.Value;
      return tagObj;
    }, {});
  }
}

module.exports = new EC2Service();
