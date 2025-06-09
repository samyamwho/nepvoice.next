'use client';

import React, { useState } from 'react';

interface GoogleLogoutButtonProps {
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  showSuccessMessage?: boolean;
  retryAttempts?: number;
}

const GoogleLogoutButton: React.FC<GoogleLogoutButtonProps> = ({
  onLogoutSuccess,
  onLogoutError,
  className = '',
  disabled = false,
  children = 'Logout',
  showSuccessMessage = true,
  retryAttempts = 2,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const attemptLogout = async (attempt: number = 0): Promise<void> => {
    const GOOGLE_LOGOUT_ENDPOINT = process.env.NEXT_PUBLIC_GOOGLE_LOGOUT_ENDPOINT;

    if (!GOOGLE_LOGOUT_ENDPOINT) {
      const msg = "Logout endpoint not configured. Please check your application settings.";
      throw new Error(msg);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch(GOOGLE_LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return;
      }

      const status = response.status;
      let errorMessageText: string;
      let isRetryableServerError = false;

      switch (status) {
        case 401:
          errorMessageText = 'Authentication failed. Please try logging in again.';
          break;
        case 403:
          errorMessageText = 'Access denied. You may not have permission to logout.';
          break;
        case 404:
          errorMessageText = 'Logout endpoint not found. Please check your configuration.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessageText = 'Server error. Please try again later.';
          isRetryableServerError = true;
          break;
        default:
          errorMessageText = `Logout failed: ${status} ${response.statusText || 'Unknown server response'}`;
      }

      if (isRetryableServerError && attempt < retryAttempts) {
        console.warn(`Logout attempt ${attempt + 1} failed with status ${status} (${errorMessageText}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        return attemptLogout(attempt + 1);
      }

      throw new Error(errorMessageText);

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.message && (
          error.message.startsWith('Authentication failed') ||
          error.message.startsWith('Access denied') ||
          error.message.startsWith('Logout endpoint not found') ||
          error.message.startsWith('Logout failed:') ||
          error.message.startsWith('Server error.') ||
          error.message.startsWith('Logout endpoint not configured')
      )) {
          throw error;
      }

      let errorMessageText: string;
      let isRetryableNetworkError = false;

      if (error.name === 'AbortError') {
        errorMessageText = 'Request timeout. Please check your connection and try again.';
      } else if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        errorMessageText = 'Network error. Please check your connection and try again.';
        isRetryableNetworkError = true;
      } else {
        errorMessageText = `An unexpected error occurred during logout: ${error.message || 'Unknown client-side error'}`;
      }

      if (isRetryableNetworkError && attempt < retryAttempts) {
        console.warn(`Logout attempt ${attempt + 1} failed due to network error (${error.message || 'details unavailable'}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        return attemptLogout(attempt + 1);
      }

      throw new Error(errorMessageText);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      await attemptLogout();

      localStorage.removeItem('user');
      sessionStorage.removeItem('user');

      if (showSuccessMessage) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

      onLogoutSuccess?.();
    } catch (error) {
      console.error('Logout error:', error);
      onLogoutError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={`px-4 py-2 bg-green-600 text-white font-medium rounded-md flex items-center justify-center space-x-2 ${className.trim()}`}>
        <span>Logged out successfully</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={disabled || isLoading}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-md transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center space-x-2 ${className.trim()}`}
      aria-label={isLoading ? 'Logging out...' : 'Logout from Google'}
    >
      <span>{isLoading ? 'Logging out...' : children}</span>
    </button>
  );
};

export default GoogleLogoutButton;