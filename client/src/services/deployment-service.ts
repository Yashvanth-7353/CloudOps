/**
 * Deployment Service Hooks
 * Handles deployment-specific business logic
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deploymentService } from './auth-service';

export const useDeployments = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['deployments', params],
    queryFn: () => deploymentService.getAll(params),
  });
};

export const useDeploymentDetail = (id: string) => {
  return useQuery({
    queryKey: ['deployment', id],
    queryFn: () => deploymentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDeployment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => deploymentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};

export const useDeleteDeployment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deploymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};

export const useDeploymentLogs = (id: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['deployment-logs', id, params],
    queryFn: () => deploymentService.getLogs(id, params),
    enabled: !!id,
    refetchInterval: 5000, // Refetch logs every 5 seconds
  });
};

export const useDeploymentStatus = (id: string) => {
  return useQuery({
    queryKey: ['deployment-status', id],
    queryFn: () => deploymentService.getStatus(id),
    enabled: !!id,
    refetchInterval: 3000, // Refetch status every 3 seconds
  });
};
