'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const WHOAMI_ENDPOINT = process.env.NEXT_PUBLIC_WHOAMI_ENDPOINT;

interface Profile {
  user_id: string;
  name: string;
  email: string;
  picture: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
}

interface ProfileProviderProps {
  children: ReactNode;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    if (!WHOAMI_ENDPOINT) {
      setError("WHOAMI endpoint is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(WHOAMI_ENDPOINT, {
        credentials: 'include', 
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
            // If response is not JSON, use the status text
        }
        throw new Error(errorMessage);
      }

      const data: Profile = await response.json();
      setProfile(data);
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};