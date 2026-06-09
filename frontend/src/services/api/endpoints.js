/**
 * API Endpoints Configuration
 * Centralized API endpoint paths
 */
export const ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        GITHUB: '/api/auth/github',
        GITHUB_CALLBACK: '/api/auth/github/callback',
        REFRESH: '/api/auth/refresh',
        VERIFY: '/api/auth/verify',
    },
    // GitHub
    GITHUB: {
        REPOSITORIES: '/api/github/repos',
    },
    // Users
    USERS: {
        ME: '/api/users/me',
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/update',
        DELETE: '/api/users/delete',
        SETTINGS: '/api/users/settings',
    },
    // Deployments
    DEPLOYMENTS: {
        LIST: '/api/deployments',
        CREATE: '/api/deployments/create',
        GET: '/api/deployments/:id',
        UPDATE: '/api/deployments/:id',
        DELETE: '/api/deployments/:id',
        LOGS: '/api/deployments/:id/logs',
        HISTORY: '/api/deployments/history',
        STATUS: '/api/deployments/:id/status',
        CANCEL: '/api/deployments/:id/cancel',
        ROLLBACK: '/api/deployments/:id/rollback',
    },
    // Projects
    PROJECTS: {
        LIST: '/api/projects',
        CREATE: '/api/projects/create',
        GET: '/api/projects/:id',
        UPDATE: '/api/projects/:id',
        DELETE: '/api/projects/:id',
    },
    // Cost Prediction
    COST: {
        PREDICT: '/api/cost/predict',
        HISTORY: '/api/cost/history',
        BREAKDOWN: '/api/cost/breakdown/:id',
        ESTIMATE: '/api/cost/estimate',
    },
    // Analytics
    ANALYTICS: {
        DASHBOARD: '/api/analytics/dashboard',
        DEPLOYMENTS: '/api/analytics/deployments',
        COSTS: '/api/analytics/costs',
        PERFORMANCE: '/api/analytics/performance',
        USAGE: '/api/analytics/usage',
    },
    // Billing
    BILLING: {
        USAGE: '/api/billing/usage',
        INVOICES: '/api/billing/invoices',
        INVOICES_DETAIL: '/api/billing/invoices/:id',
        PLANS: '/api/billing/plans',
        UPDATE_PLAN: '/api/billing/update-plan',
        PAYMENT_METHOD: '/api/billing/payment-method',
    },
    // Webhooks
    WEBHOOKS: {
        LIST: '/api/webhooks',
        CREATE: '/api/webhooks/create',
        UPDATE: '/api/webhooks/:id',
        DELETE: '/api/webhooks/:id',
        TEST: '/api/webhooks/:id/test',
    },
    // Health & Status
    HEALTH: {
        CHECK: '/api/health',
        STATUS: '/api/status',
    },
};
/**
 * Generate endpoint URL with path parameters
 */
export const generateEndpoint = (template, params) => {
    let url = template;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
    });
    return url;
};
/**
 * Check if endpoint requires authentication
 */
export const isProtectedEndpoint = (endpoint) => {
    const publicEndpoints = [ENDPOINTS.AUTH.LOGIN, ENDPOINTS.AUTH.GITHUB, ENDPOINTS.HEALTH.CHECK];
    return !publicEndpoints.includes(endpoint);
};
