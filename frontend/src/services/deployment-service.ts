import { axiosClient } from './api/axios-client';

export const deploymentService = {
  // Add this inside the deploymentService object:
  startBuild: async (repositoryName: string, repositoryOwner: string) => {
    try {
      const response = await axiosClient.post('/api/deploy/start-build', { repositoryName, repositoryOwner });
      return response.data;
    } catch (error: any) {
// ...
      throw new Error(error.response?.data?.error || 'Failed to start build engine');
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