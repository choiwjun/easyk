import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authStorage from '@/utils/authStorage';

/**
 * Role-based route protection hook
 *
 * @param allowedRoles - Array of roles that can access this page
 * @param redirectTo - Optional custom redirect URL (default: '/' for users, '/consultant/dashboard' for consultants)
 * @returns isAuthorized - Boolean indicating if user is authorized
 *
 * @example
 * // Protect admin-only page
 * const isAuthorized = useRoleGuard(['admin']);
 *
 * @example
 * // Protect consultant and admin page
 * const isAuthorized = useRoleGuard(['consultant', 'admin']);
 */
export function useRoleGuard(allowedRoles: string[], redirectTo?: string): boolean {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authStorage.getToken();
        let user = authStorage.getUser<{ role: string }>();

        if (!token) {
          router.push('/login');
          return;
        }

        // Verify with API if no user in sessionStorage
        if (!user) {
          const response = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            authStorage.clearAll();
            router.push('/login');
            return;
          }

          const userData = await response.json();
          if (userData) {
            user = userData;
            authStorage.setUser(userData);
          }
        }

        if (!user) {
          router.push('/login');
          return;
        }

        if (!allowedRoles.includes(user.role)) {
          // Determine redirect based on user role
          const redirect = redirectTo || (user.role === 'consultant' ? '/consultant/dashboard' : '/');
          router.push(redirect);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles, redirectTo]);

  return isAuthorized && !isLoading;
}

/**
 * Hook for protecting consultant-only pages
 * Redirects non-consultants to home page
 */
export function useConsultantGuard(): boolean {
  return useRoleGuard(['consultant', 'admin']);
}

/**
 * Hook for protecting user-only pages (foreign users)
 * Redirects consultants to their dashboard
 */
export function useUserGuard(): boolean {
  return useRoleGuard(['foreign', 'admin'], '/consultant/dashboard');
}
