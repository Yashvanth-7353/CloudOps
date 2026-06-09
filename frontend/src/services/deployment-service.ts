import { axiosClient } from './api/axios-client';

export type FileNode = {
  name: string;
  type: 'file' | 'directory';
  path?: string;
  children?: FileNode[];
};

export type SuggestedRoot = {
  path: string;
  label: string;
  hasPackageJson: boolean;
};

export type SuggestedEnvVar = {
  key: string;
  value: string;
  isPublic: boolean;
};

export type FrameworkDetection = {
  framework: string;
  preset: string;
  displayName: string;
  buildCommand: string | null;
  installCommand: string;
  outputDirectory: string;
  deployType: 'static' | 'container';
  confidence: number;
  suggestedEnvVars: SuggestedEnvVar[];
  rootDirectory: string;
  details?: Record<string, unknown>;
};

export const deploymentService = {
  startBuild: async (data: { projectId?: string; repositoryName: string; repositoryOwner?: string }) => {
    try {
      const response = await axiosClient.post('/api/deploy/start-build', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to start build engine');
    }
  },

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

  startAzureDeployment: async (data: {
    repoUrl: string;
    appName: string;
    socketId?: string;
  }) => {
    try {
      const response = await axiosClient.post('/api/azure/deploy', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to start Azure deployment');
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

  detectFramework: async (clonePath: string, rootDirectory: string) => {
    try {
      const response = await axiosClient.post('/api/deploy/detect', { clonePath, rootDirectory });
      return response.data as FrameworkDetection;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to detect framework');
    }
  },

  saveFiles: async (data: {
    clonePath: string;
    envContent: string;
    envPath: string;
    dockerfileContent?: string;
    rootDirectory?: string;
    deployType?: 'static';
  }) => {
    try {
      const response = await axiosClient.post('/api/deploy/save-files', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to save deployment files');
    }
  },

  startStaticBuild: async (data: {
    repositoryName: string;
    clonePath: string;
    rootDirectory: string;
    buildCommand?: string;
    outputDirectory?: string;
    environmentVariables?: Record<string, string>;
    deployType?: 'static';
  }) => {
    try {
      const response = await axiosClient.post('/api/deploy/start-static-build', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to start static build');
    }
  },
};
