import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, AUTH_TOKEN_KEY } from '@/lib/constants';
const createAxiosClient = () => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: API_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // Request interceptor
    client.interceptors.request.use((config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => Promise.reject(error));
    // Response interceptor
    client.interceptors.response.use((response) => response, (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    });
    return client;
};
export const axiosClient = createAxiosClient();
