import { apiClient } from './api/interceptors';
import { ENDPOINTS } from './api/endpoints';
import { axiosClient } from './api/axios-client';
export const githubService = {
    listRepositories: () => apiClient.get(ENDPOINTS.GITHUB.REPOSITORIES),
    connectRepository: async (repoData) => {
        try {
            const response = await axiosClient.post('/api/github/connect', repoData);
            return response.data;
        }
        catch (error) {
            console.error('Failed to connect repo:', error);
            throw new Error(error.response?.data?.error || 'Failed to connect repository');
        }
    },
    // Add this inside the githubService object
    removeRepository: async (owner, repo) => {
        try {
            const response = await axiosClient.delete(`/api/github/disconnect/${owner}/${repo}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to remove repo:', error);
            throw new Error(error.response?.data?.error || 'Failed to remove repository');
        }
    },
};
