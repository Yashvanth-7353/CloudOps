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
  initDeploy: async (repositoryName: string, repositoryOwner: string) => {
    const response = await axiosClient.post('/api/deploy/init', { repositoryName, repositoryOwner });
    return response.data as {
      clonePath: string;
      fileTree: FileNode[];
      suggestedRoots: SuggestedRoot[];
      defaultBranch: string;
      repositoryName: string;
      repositoryOwner: string;
    };
  },

  detectFramework: async (clonePath: string, rootDirectory: string) => {
    const response = await axiosClient.post('/api/deploy/detect', { clonePath, rootDirectory });
    return response.data as FrameworkDetection;
  },

  saveFiles: async (data: {
    clonePath: string;
    envContent: string;
    envPath: string;
    rootDirectory?: string;
  }) => {
    const response = await axiosClient.post('/api/deploy/save-files', data);
    return response.data;
  },

  startBuild: async (data: {
    repositoryName: string;
    clonePath: string;
    rootDirectory: string;
    buildCommand?: string;
    outputDirectory?: string;
    environmentVariables?: Record<string, string>;
    deployType?: 'static' | 'container';
  }) => {
    const response = await axiosClient.post('/api/deploy/start-build', data);
    return response.data;
  },
};
