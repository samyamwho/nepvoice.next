    // hooks/useNavigationGuard.ts
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/app/(auth)/CurrentProfile';

const protectedRoutes = ['/main']; 

export const useNavigationGuard = () => {
  const { isAuthenticated, isLoading } = useProfile();
//   const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // If on a protected route and not authenticated, redirect
    if (isProtectedRoute && !isAuthenticated) {
      console.log('Navigation guard: Redirecting unauthenticated user from', pathname);
      window.location.href = '/googleauth';
    }
  }, [pathname, isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};
