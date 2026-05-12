/**
 * useAuth Hook
 * Custom hook for authentication state and operations
 */

import { useCallback } from 'react';
import { useAuth } from '@/app/providers/auth-provider';
import { authService } from '@/services/auth-service';

export const useAuthHook = () => {
  const auth = useAuth();

  const loginWithGitHub = useCallback(async (code: string, state: string) => {
    try {
      const response = await authService.githubLogin(code, state);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      await auth.login({ token, user });
    } catch (error) {
      throw error;
    }
  }, [auth]);

  const logout = useCallback(() => {
    auth.logout();
    localStorage.removeItem('auth_token');
  }, [auth]);

  return {
    ...auth,
    loginWithGitHub,
    logout,
  };
};
