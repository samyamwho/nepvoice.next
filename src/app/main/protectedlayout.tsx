'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/app/(auth)/CurrentProfile';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, error, fetchProfile } = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const lastAuthCheck = useRef<number>(0);

  // Force re-authentication check on every route change
  useEffect(() => {
    const checkAuth = async () => {
      const now = Date.now();
      // Prevent too frequent checks (debounce by 1 second)
      if (now - lastAuthCheck.current < 1000) return;
      
      lastAuthCheck.current = now;
      console.log('ProtectedLayout: Route changed, re-checking authentication');
      
      // Re-fetch profile to ensure we have the latest auth state
      await fetchProfile();
    };

    checkAuth();
  }, [pathname, fetchProfile]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      console.log('ProtectedLayout: User not authenticated, redirecting to /googleauth');
      // Use window.location for hard navigation to ensure middleware runs
      window.location.href = '/googleauth';
    }
  }, [isAuthenticated, isLoading]);

  // Additional protection: Listen for navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This won't prevent navigation but helps with cleanup
      if (!isAuthenticated && !isLoading) {
        console.log('ProtectedLayout: Unauthenticated navigation detected');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading user profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedLayout;