'use client';

import { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useProfile } from '@/app/(auth)/CurrentProfile'; // Import the profile hook

interface GoogleLogoutButtonProps {
  onLogoutSuccess?: () => void;
  redirectPath?: string;
  buttonText?: string;
  loadingText?: string;
}

const GOOGLE_LOGOUT_ENDPOINT: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_LOGOUT_ENDPOINT;

export default function GoogleLogoutButton({
  onLogoutSuccess,
  redirectPath = '/',
  buttonText = 'Logout',
  loadingText = 'Logging out...'
}: GoogleLogoutButtonProps): JSX.Element {
  const router: AppRouterInstance = useRouter();
  const { clearProfile } = useProfile(); // Get clearProfile from context
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async (): Promise<void> => {
    if (!GOOGLE_LOGOUT_ENDPOINT) {
      setError("Logout endpoint not configured.");
      console.error("Logout endpoint is not configured. Please check environment variables.");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Attempting to logout via endpoint:", GOOGLE_LOGOUT_ENDPOINT);

    try {
      const response: Response = await fetch(GOOGLE_LOGOUT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      console.log("Logout API response status:", response.status);

      if (response.ok) {
        try {
          const data: { message: string } = await response.json();
          console.log('Backend logout successful:', data.message);
        } catch (e) {
          console.log('Backend logout successful, but response body was not standard JSON or was empty.');
        }

        // Clear the client-side profile state BEFORE calling callbacks or redirecting
        clearProfile();
        
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
        
        // Force a hard navigation to ensure middleware re-runs
        // This is necessary because Next.js middleware doesn't run on client-side navigation
        window.location.href = redirectPath;
      } else {
        let errorDataMessage: string = 'Server error during logout.';
        try {
          const errorData: any = await response.json();
          errorDataMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          errorDataMessage = (await response.text()) || `Logout failed with status: ${response.status}`;
        }
        console.error('Logout failed from backend:', response.status, errorDataMessage);
        setError(errorDataMessage);
      }
    } catch (err: any) {
      console.error('Network or other error during logout request:', err);
      setError(`An error occurred: ${err.message || 'Network error or CORS issue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    backgroundColor: isLoading ? '#ccc' : '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    width: '100%',
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        style={buttonStyle}
        type="button"
      >
        {isLoading ? loadingText : buttonText}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.875rem' }}>Error: {error}</p>}
    </>
  );
}