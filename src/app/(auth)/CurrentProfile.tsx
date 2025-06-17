/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

const WHOAMI_ENDPOINT = process.env.NEXT_PUBLIC_WHOAMI_ENDPOINT;

export interface Profile {
  user_id: string;
  name: string;
  email: string;
  picture: string;
}

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  fetchOnMount?: boolean;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
  fetchOnMount = true,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(fetchOnMount);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);
  const mounted = useRef(true);

  const fetchProfile = useCallback(async () => {
    // Prevent concurrent requests
    if (fetchInProgress.current || !mounted.current) {
      return;
    }

    if (!WHOAMI_ENDPOINT) {
      console.error("ProfileContext: NEXT_PUBLIC_WHOAMI_ENDPOINT is not defined.");
      if (mounted.current) {
        setError("Configuration error: WHOAMI endpoint is missing.");
        setIsLoading(false);
        setProfile(null);
      }
      return;
    }

    fetchInProgress.current = true;
    if (mounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(WHOAMI_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!mounted.current) return;

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setProfile(null);
          setError(null);
          console.warn(`User is unauthorized (status ${response.status}).`);
        } else {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch (_) {
            // Ignore JSON parse errors
          }
          throw new Error(errorMessage);
        }
      } else {
        const data: Profile = await response.json();
        if (mounted.current) {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      if (mounted.current) {
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: unknown }).message)
            : 'An unexpected error occurred while fetching profile.'
        );
        setProfile(null);
      }
    } finally {
      fetchInProgress.current = false;
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearProfile = useCallback(() => {
    if (mounted.current) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
    }
    fetchInProgress.current = false;
  }, []);

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount && mounted.current) {
      fetchProfile();
    }

    return () => {
      mounted.current = false;
    };
  }, [fetchProfile, fetchOnMount]);

  const isAuthenticated = !!profile && Object.keys(profile).length > 0;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        isAuthenticated,
        fetchProfile,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};