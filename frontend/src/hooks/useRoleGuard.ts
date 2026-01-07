import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token) {
          router.push('/login');
          return;
        }

        // First check localStorage for faster response
        let user = userStr ? JSON.parse(userStr) : null;

        // Verify with API if no user in localStorage
        if (!user) {
          const response = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }

          user = await response.json();
          localStorage.setItem('user', JSON.stringify(user));
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
