import { apiClient } from './api/interceptors';
import { ENDPOINTS } from './api/endpoints';

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
};