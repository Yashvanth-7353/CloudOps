import { apiClient } from './api/interceptors';
import { ENDPOINTS, generateEndpoint } from './api/endpoints';
/**
 * Auth Service
 * Handles authentication-related API calls
 */
export const authService = {
    login: (email, password) => apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
    githubLogin: (code, state) => apiClient.post(ENDPOINTS.AUTH.GITHUB_CALLBACK, { code, state }),
    logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
    refresh: (refreshToken) => apiClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken }),
    verify: () => apiClient.get(ENDPOINTS.AUTH.VERIFY),
    getMe: () => apiClient.get(ENDPOINTS.USERS.ME),
};
/**
 * Deployment Service
 * Handles deployment-related API calls
 */
export const deploymentService = {
    getAll: (params) => apiClient.get(ENDPOINTS.DEPLOYMENTS.LIST, { params }),
    getById: (id) => apiClient.get(generateEndpoint(ENDPOINTS.DEPLOYMENTS.GET, { id })),
    create: (data) => apiClient.post(ENDPOINTS.DEPLOYMENTS.CREATE, data),
    update: (id, data) => apiClient.put(generateEndpoint(ENDPOINTS.DEPLOYMENTS.UPDATE, { id }), data),
    delete: (id) => apiClient.delete(generateEndpoint(ENDPOINTS.DEPLOYMENTS.DELETE, { id })),
    getLogs: (id, params) => apiClient.get(generateEndpoint(ENDPOINTS.DEPLOYMENTS.LOGS, { id }), { params }),
    getStatus: (id) => apiClient.get(generateEndpoint(ENDPOINTS.DEPLOYMENTS.STATUS, { id })),
    cancel: (id) => apiClient.post(generateEndpoint(ENDPOINTS.DEPLOYMENTS.CANCEL, { id })),
    rollback: (id) => apiClient.post(generateEndpoint(ENDPOINTS.DEPLOYMENTS.ROLLBACK, { id })),
};
/**
 * Cost Service
 * Handles cost prediction and tracking API calls
 */
export const costService = {
    predictCost: (repositoryUrl, appType) => apiClient.post(ENDPOINTS.COST.PREDICT, { repositoryUrl, appType }),
    getHistory: (params) => apiClient.get(ENDPOINTS.COST.HISTORY, { params }),
    getBreakdown: (deploymentId) => apiClient.get(generateEndpoint(ENDPOINTS.COST.BREAKDOWN, { id: deploymentId })),
    estimateCost: (config) => apiClient.post(ENDPOINTS.COST.ESTIMATE, config),
};
/**
 * Analytics Service
 * Handles analytics and reporting API calls
 */
export const analyticsService = {
    getDashboard: () => apiClient.get(ENDPOINTS.ANALYTICS.DASHBOARD),
    getDeploymentAnalytics: (params) => apiClient.get(ENDPOINTS.ANALYTICS.DEPLOYMENTS, { params }),
    getCostAnalytics: (params) => apiClient.get(ENDPOINTS.ANALYTICS.COSTS, { params }),
    getPerformanceMetrics: (params) => apiClient.get(ENDPOINTS.ANALYTICS.PERFORMANCE, { params }),
};
/**
 * Billing Service
 * Handles billing and subscription API calls
 */
export const billingService = {
    getUsage: () => apiClient.get(ENDPOINTS.BILLING.USAGE),
    getInvoices: (params) => apiClient.get(ENDPOINTS.BILLING.INVOICES, { params }),
    getInvoiceDetail: (invoiceId) => apiClient.get(generateEndpoint(ENDPOINTS.BILLING.INVOICES_DETAIL, { id: invoiceId })),
    getPlans: () => apiClient.get(ENDPOINTS.BILLING.PLANS),
    updatePlan: (planId) => apiClient.post(ENDPOINTS.BILLING.UPDATE_PLAN, { planId }),
};
