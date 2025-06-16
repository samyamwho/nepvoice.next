'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/app/(auth)/CurrentProfile';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, error, fetchProfile } = useProfile();
  const router = useRouter();
  const skipAuth = process.env.NEXT_PUBLIC_DEV_MODE_SKIP_AUTH === 'true';

  useEffect(() => {
    if (skipAuth) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/googleauth');
    }
  }, [isAuthenticated, isLoading, router, error, skipAuth]);

  useEffect(() => {
    if (skipAuth) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading) {
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchProfile, isLoading, skipAuth]);

  if (skipAuth) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading user profile...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div>Verifying authentication and preparing redirect...</div>
    </div>
  );
};

export default ProtectedLayout;
