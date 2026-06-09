/**
 * Analytics Service Hooks
 * Handles analytics data retrieval
 */
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from './auth-service';
export const useAnalyticsDashboard = () => {
    return useQuery({
        queryKey: ['analytics-dashboard'],
        queryFn: () => analyticsService.getDashboard(),
    });
};
export const useDeploymentAnalytics = (params) => {
    return useQuery({
        queryKey: ['analytics-deployments', params],
        queryFn: () => analyticsService.getDeploymentAnalytics(params),
    });
};
export const useCostAnalytics = (params) => {
    return useQuery({
        queryKey: ['analytics-costs', params],
        queryFn: () => analyticsService.getCostAnalytics(params),
    });
};
export const usePerformanceMetrics = (params) => {
    return useQuery({
        queryKey: ['analytics-performance', params],
        queryFn: () => analyticsService.getPerformanceMetrics(params),
    });
};
