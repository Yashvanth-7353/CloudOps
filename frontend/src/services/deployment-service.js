import { axiosClient } from './api/axios-client';
export const deploymentService = {
    initDeploy: async (repositoryName, repositoryOwner) => {
        const response = await axiosClient.post('/api/deploy/init', { repositoryName, repositoryOwner });
        return response.data;
    },
    detectFramework: async (clonePath, rootDirectory) => {
        const response = await axiosClient.post('/api/deploy/detect', { clonePath, rootDirectory });
        return response.data;
    },
    saveFiles: async (data) => {
        const response = await axiosClient.post('/api/deploy/save-files', data);
        return response.data;
    },
    startBuild: async (data) => {
        const response = await axiosClient.post('/api/deploy/start-build', data);
        return response.data;
    },
};
