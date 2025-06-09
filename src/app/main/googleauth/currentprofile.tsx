'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

  const fetchProfile = useCallback(async () => {
    console.log("Attempting to fetch profile...");
    setLoading(true);
    setError(null);
    setProfile(null);

    if (!WHOAMI_ENDPOINT) {
      const errMsg = "WHOAMI_ENDPOINT is not configured. Please check your .env.local or environment variables.";
      console.error(errMsg);
      setError(errMsg);
      setLoading(false);
      return;
    }

    console.log(`Fetching profile from: ${WHOAMI_ENDPOINT}`);

    try {
      const response = await fetch(WHOAMI_ENDPOINT, {
        credentials: 'include',
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
            console.warn("Could not parse error response as JSON. Using status text.", e);
        }
        throw new Error(errorMessage);
      }

      const data: Profile = await response.json();
      console.log("Profile data received:", data);
      setProfile(data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error fetching profile:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("Profile fetch attempt finished.");
    }
  }, []);

  useEffect(() => {
    console.log("ProfileProvider mounted. Initializing profile fetch.");
    fetchProfile();
  }, [fetchProfile]);

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