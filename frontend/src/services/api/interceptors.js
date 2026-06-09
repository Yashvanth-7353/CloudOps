import { axiosClient } from './axios-client';
export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/api/auth/login',
    AUTH_GITHUB: '/api/auth/github',
    AUTH_GITHUB_CALLBACK: '/api/auth/github/callback',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_REFRESH: '/api/auth/refresh',
    // Users
    USERS_ME: '/api/users/me',
    USERS_PROFILE: '/api/users/profile',
    USERS_UPDATE: '/api/users/update',
    // Deployments
    DEPLOYMENTS_LIST: '/api/deployments',
    DEPLOYMENTS_CREATE: '/api/deployments/create',
    DEPLOYMENTS_DETAIL: '/api/deployments/:id',
    DEPLOYMENTS_DELETE: '/api/deployments/:id',
    DEPLOYMENTS_LOGS: '/api/deployments/:id/logs',
    DEPLOYMENTS_HISTORY: '/api/deployments/history',
    // Cost Prediction
    COST_PREDICT: '/api/cost/predict',
    COST_HISTORY: '/api/cost/history',
    // Analytics
    ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
    ANALYTICS_DEPLOYMENTS: '/api/analytics/deployments',
    ANALYTICS_COSTS: '/api/analytics/costs',
    // Billing
    BILLING_USAGE: '/api/billing/usage',
    BILLING_INVOICES: '/api/billing/invoices',
    BILLING_PLANS: '/api/billing/plans',
    // Health
    HEALTH_CHECK: '/api/health',
};
export class ApiClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axiosClient;
    }
    async get(url, config) {
        return this.client.get(url, config);
    }
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
    async put(url, data, config) {
        return this.client.put(url, data, config);
    }
    async patch(url, data, config) {
        return this.client.patch(url, data, config);
    }
    async delete(url, config) {
        return this.client.delete(url, config);
    }
}
export const apiClient = new ApiClient();
