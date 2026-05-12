import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
} as const;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axiosClient;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
