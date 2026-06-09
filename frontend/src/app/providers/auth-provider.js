import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { authService } from '@/services/auth-service';
const AuthContext = window.__cloudopsAuthContext || createContext(undefined);
window.__cloudopsAuthContext = AuthContext;
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url)
            return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    }
    catch {
        return null;
    }
};
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const login = useCallback(async (credentials) => {
        setLoading(true);
        try {
            if (credentials.token) {
                // Token from OAuth callback
                localStorage.setItem('cloudops_auth_token', credentials.token);
                const payload = decodeJWT(credentials.token);
                if (!payload) {
                    localStorage.removeItem('cloudops_auth_token');
                    setIsAuthenticated(false);
                    setUser(null);
                    return false;
                }
                setIsAuthenticated(true);
                setUser(payload);
                return true;
            }
            else {
                // Regular login
                const response = await authService.login(credentials.email, credentials.password);
                localStorage.setItem('cloudops_auth_token', response.data.token);
                setIsAuthenticated(true);
                setUser(response.data.user);
                return true;
            }
        }
        catch (error) {
            console.error('Auth login failed:', error);
            localStorage.removeItem('cloudops_auth_token');
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const logout = useCallback(() => {
        localStorage.removeItem('cloudops_auth_token');
        setIsAuthenticated(false);
        setUser(null);
    }, []);
    const verifyAuth = useCallback(async () => {
        const token = localStorage.getItem('cloudops_auth_token');
        if (token) {
            try {
                const response = await authService.verify();
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
            catch (error) {
                localStorage.removeItem('cloudops_auth_token');
                setIsAuthenticated(false);
                setUser(null);
            }
        }
        setLoading(false);
    }, []);
    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);
    const value = useMemo(() => ({
        isAuthenticated,
        user,
        login,
        logout,
        loading,
    }), [isAuthenticated, user, login, logout, loading]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#06070f] text-white", children: _jsxs("div", { className: "text-center px-4 py-8 rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md", children: [_jsx("div", { className: "text-xl font-semibold mb-2", children: "Checking authentication\u2026" }), _jsx("div", { className: "text-sm text-white/70", children: "Please wait while we restore your session." })] }) }));
    }
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
