import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Role-based route protection hook
 *
 * @param allowedRoles - Array of roles that can access this page
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
export function useRoleGuard(allowedRoles: string[]): boolean {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem('access_token');
          router.push('/login');
          return;
        }

        const user = await response.json();

        if (!allowedRoles.includes(user.role)) {
          router.push('/');
          alert('접근 권한이 없습니다');
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
  }, [router, allowedRoles]);

  return isAuthorized && !isLoading;
}
