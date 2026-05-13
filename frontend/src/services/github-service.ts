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

export const githubService = {
  listRepositories: () => apiClient.get<{ repositories: GitHubRepository[] }>(ENDPOINTS.GITHUB.REPOSITORIES),

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
  }
};