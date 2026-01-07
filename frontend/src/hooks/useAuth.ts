import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authStorage from '@/utils/authStorage';

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
  requireConsultant: () => void;
  requireUser: () => void;
  isConsultant: boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from sessionStorage
  useEffect(() => {
    try {
      const token = authStorage.getToken();
      const user = authStorage.getUser<User>();

      if (token && user) {
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
    authStorage.login(token, user);
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // Logout function - 모든 인증 데이터 초기화
  const logout = useCallback(() => {
    authStorage.clearAll(); // 완전 초기화
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
      if (authState.isLoading) return true; // Still loading, don't redirect yet

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
    [authState.isLoading, authState.isAuthenticated, authState.user, router]
  );

  // Require consultant role - redirect to consultant dashboard if consultant tries to access user pages
  const requireConsultant = useCallback(
    () => {
      if (authState.isLoading) return;

      if (!authState.isAuthenticated || !authState.user) {
        router.push('/login');
        return;
      }

      if (authState.user.role !== 'consultant') {
        router.push('/');
        return;
      }
    },
    [authState.isLoading, authState.isAuthenticated, authState.user, router]
  );

  // Require user role - redirect consultants to their dashboard
  const requireUser = useCallback(
    () => {
      if (authState.isLoading) return;

      if (!authState.isAuthenticated || !authState.user) {
        router.push('/login');
        return;
      }

      if (authState.user.role === 'consultant') {
        router.push('/consultant/dashboard');
        return;
      }
    },
    [authState.isLoading, authState.isAuthenticated, authState.user, router]
  );

  // Check if current user is a consultant
  const isConsultant = authState.user?.role === 'consultant';

  return {
    ...authState,
    login,
    logout,
    getAuthHeader,
    requireAuth,
    requireRole,
    requireConsultant,
    requireUser,
    isConsultant,
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
        authStorage.clearAll();
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      return response;
    },
    [getAuthHeader]
  );

  return authFetch;
}
