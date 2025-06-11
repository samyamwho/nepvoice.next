'use client';

import { useState } from 'react';

const GOOGLE_LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENDPOINT;

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    if (GOOGLE_LOGIN_ENDPOINT) {
      window.location.href = GOOGLE_LOGIN_ENDPOINT;
    } else {
      console.error("Google login endpoint is not configured.");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full bg-[#000000] hover:bg-[#333433] text-white rounded-lg px-4 py-2.5 shadow-sm transition-all duration-300 text-sm font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          Logging in...
        </span>
      ) : (
        <>Log in with Google</>
      )}
    </button>
  );
};

export default GoogleLoginButton;