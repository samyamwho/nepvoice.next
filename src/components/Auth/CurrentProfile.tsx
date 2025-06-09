'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  error: Error | null;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true, 
  error: null,
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setProfile(null);

      if (!WHOAMI_ENDPOINT) {
        console.error('WHOAMI_ENDPOINT is not defined. Please set NEXT_PUBLIC_WHOAMI_ENDPOINT in your .env.local file.');
        setError(new Error('Application configuration error: WHOAMI endpoint is not set.'));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(WHOAMI_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let errorMessage = `API Error: ${response.status} ${response.statusText}`;
          try {
            // Attempt to get a more specific error message from the response body
            const errorData = await response.json();
            if (errorData && (errorData.message || errorData.error)) {
              errorMessage = `API Error: ${errorData.message || errorData.error}`;
            }
          } catch (jsonError) {
            // If parsing error body fails, stick with statusText
            console.warn('Could not parse error response JSON:', jsonError);
          }
          throw new Error(errorMessage);
        }

        const data: Profile = await response.json();

        if (!data.user_id || !data.name || !data.email) {
            throw new Error('Received incomplete profile data from API.');
        }

        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred while fetching profile data.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};