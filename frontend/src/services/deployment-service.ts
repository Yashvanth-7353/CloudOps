import { axiosClient } from './api/axios-client';

export const deploymentService = {
  // Local deployment (runs on backend server on port 4002-4999)
  startBuild: async (data: { projectId?: string; repositoryName: string; repositoryOwner?: string }) => {
    try {
      const response = await axiosClient.post('/api/deploy/start-build', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to start build engine');
    }
  },

  // AWS EC2 deployment (builds locally, pushes to ECR, runs on EC2)
  startAWSDeployment: async (data: {
    repositoryUrl: string;
    repositoryName: string;
    repositoryOwner?: string;
    branch?: string;
    instanceType?: string;
    keyName?: string;
    environmentVariables?: Record<string, string>;
  }) => {
    try {
      const response = await axiosClient.post('/api/deploy/aws-ec2', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to start AWS deployment');
    }
  },

  initDeploy: async (repositoryName: string, repositoryOwner: string) => {
    try {
      const response = await axiosClient.post('/api/deploy/init', { repositoryName, repositoryOwner });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to initialize deployment');
    }
  },

  saveFiles: async (data: { clonePath: string, envContent: string, envPath: string, dockerfileContent?: string }) => {
    try {
      const response = await axiosClient.post('/api/deploy/save-files', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to save deployment files');
    }
  }
};