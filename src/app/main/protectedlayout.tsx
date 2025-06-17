'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/app/(auth)/CurrentProfile';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, profile, fetchProfile } = useProfile();
  const router = useRouter();
  const skipAuth = process.env.NEXT_PUBLIC_DEV_MODE_SKIP_AUTH === 'true';
  const initialLoadComplete = useRef(false);
  const redirectAttempted = useRef(false);

  // Handle initial authentication check
  useEffect(() => {
    if (skipAuth) {
      initialLoadComplete.current = true;
      return;
    }

    if (isLoading) {
      return;
    }

    initialLoadComplete.current = true;

    // Only redirect if not authenticated and haven't tried redirecting yet
    if (!isAuthenticated && !redirectAttempted.current) {
      redirectAttempted.current = true;
      console.log('Redirecting to /googleauth - user not authenticated');
      router.replace('/googleauth');
    }
  }, [isAuthenticated, isLoading, router, skipAuth]);

  // Only add visibility listeners after initial load
  useEffect(() => {
    if (skipAuth || !initialLoadComplete.current) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Debounce profile fetches
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [fetchProfile, isAuthenticated, skipAuth]);

  // Skip auth mode
  if (skipAuth) {
    return <>{children}</>;
  }

  // Still loading initial profile
  if (isLoading && !initialLoadComplete.current) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading user profile...</div>
      </div>
    );
  }

  // Authenticated user
  if (isAuthenticated && profile) {
    return <>{children}</>;
  }

  // Not authenticated but redirect not attempted yet
  if (!isAuthenticated && !redirectAttempted.current) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Checking authentication...</div>
      </div>
    );
  }

  // Redirect in progress
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div>Redirecting to login...</div>
    </div>
  );
};

export default ProtectedLayout;