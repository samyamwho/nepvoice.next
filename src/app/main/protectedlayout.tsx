'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/app/(auth)/CurrentProfile';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      console.log('ProtectedLayout: User not authenticated (or error), redirecting to /googleauth');
      router.replace('/googleauth');
    }

  }, [isAuthenticated, isLoading, router, error]);

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