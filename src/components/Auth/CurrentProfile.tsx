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
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        credentials: 'include', // Needed if using cookies
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (_) {
          // Fallback if response body isn't JSON
        }

        if (response.status === 401 || response.status === 403) {
          setProfile(null);
          console.warn('User is unauthorized or forbidden. Clearing profile.');
        } else {
          throw new Error(errorMessage);
        }
      } else {
        const data: Profile = await response.json();
        setProfile(data);
        console.info("Fetched profile:", data);
      }
    } catch (err: any) {
      console.error("Failed to fetch profile from", WHOAMI_ENDPOINT, err);
      setError(err.message || 'An unexpected error occurred while fetching profile.');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
