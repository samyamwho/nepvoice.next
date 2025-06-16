'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  fetchOnMount?: boolean; // Controls if fetchProfile runs on initial mount
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
  fetchOnMount = true, // Default to true: try to fetch profile when provider mounts
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  // isLoading is true initially only if we are attempting to fetch on mount.
  const [isLoading, setIsLoading] = useState<boolean>(fetchOnMount);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!WHOAMI_ENDPOINT) {
      console.error("ProfileContext: NEXT_PUBLIC_WHOAMI_ENDPOINT is not defined.");
      setError("Configuration error: WHOAMI endpoint is missing.");
      setIsLoading(false);
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WHOAMI_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (_) {
          console.warn("Failed to parse error response as JSON:", _);
        }

        if (response.status === 401 || response.status === 403) {
          setProfile(null);
          setError(null);
          console.warn(`User is unauthorized (status ${response.status}). No active session cookie or session is invalid.`);
        } else {
          throw new Error(errorMessage);
        }
      } else {
        const data: Profile = await response.json();
        setProfile(data);
        console.info("Fetched profile (likely due to valid session cookie):", data);
      }
    } catch (err) {
      console.error("Failed to fetch profile from", WHOAMI_ENDPOINT, err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message)
          : 'An unexpected error occurred while fetching profile.'
      );
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      fetchProfile();
    }
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