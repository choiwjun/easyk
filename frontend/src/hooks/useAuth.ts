import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'foreign' | 'consultant' | 'admin';
  nationality?: string;
  phone_number?: string;
  visa_type?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
  requireAuth: (redirectTo?: string) => void;
  requireRole: (allowedRoles: string[], redirectTo?: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/login');
  }, [router]);

  // Get authorization header for API calls
  const getAuthHeader = useCallback(() => {
    if (authState.token) {
      return { Authorization: `Bearer ${authState.token}` };
    }
    return {};
  }, [authState.token]);

  // Require authentication (redirect if not authenticated)
  const requireAuth = useCallback(
    (redirectTo: string = '/login') => {
      if (!authState.isLoading && !authState.isAuthenticated) {
        router.push(redirectTo);
      }
    },
    [authState.isLoading, authState.isAuthenticated, router]
  );

  // Require specific role (return false if not authorized)
  const requireRole = useCallback(
    (allowedRoles: string[], redirectTo: string = '/') => {
      if (!authState.isAuthenticated || !authState.user) {
        router.push('/login');
        return false;
      }

      if (!allowedRoles.includes(authState.user.role)) {
        router.push(redirectTo);
        return false;
      }

      return true;
    },
    [authState.isAuthenticated, authState.user, router]
  );

  return {
    ...authState,
    login,
    logout,
    getAuthHeader,
    requireAuth,
    requireRole,
  };
}

// Hook for fetching with authentication
export function useAuthFetch() {
  const { getAuthHeader } = useAuth();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      return response;
    },
    [getAuthHeader]
  );

  return authFetch;
}
