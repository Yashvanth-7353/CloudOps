import { apiClient } from './api/interceptors';
import { ENDPOINTS } from './api/endpoints';
import { axiosClient } from './api/axios-client';

export type GitHubRepository = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  htmlUrl: string;
  cloneUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
};

export type ConnectedRepository = {
  id: string;
  name: string;
  fullName: string;
  repositoryUrl: string;
  isPrivate: boolean;
  description: string;
  status: 'connected' | 'deploying' | 'active' | 'failed';
  createdAt: string;
  updatedAt: string;
  webhookId: string;
  lastDeployedAt?: string;
};

export const githubService = {
  // Get repositories from GitHub API (user's all repos)
  listRepositories: () => apiClient.get<{ repositories: GitHubRepository[] }>(ENDPOINTS.GITHUB.REPOSITORIES),

  // Get connected repositories from MongoDB
  getConnectedRepositories: async () => {
    try {
      const response = await axiosClient.get<{ 
        success: boolean;
        count: number;
        repositories: ConnectedRepository[] 
      }>('/api/github/connected');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch connected repositories:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch connected repositories');
    }
  },

  connectRepository: async (repoData: {
    repositoryName: string;
    repositoryOwner: string;
    repositoryUrl: string;
    isPrivate: boolean;
    description?: string;
  }) => {
    try {
      const response = await axiosClient.post('/api/github/connect', repoData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to connect repo:', error);
      throw new Error(error.response?.data?.error || 'Failed to connect repository');
    }
  },

  removeRepository: async (owner: string, repo: string) => {
    try {
      const response = await axiosClient.delete(`/api/github/disconnect/${owner}/${repo}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to remove repo:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove repository');
    }
  },
};