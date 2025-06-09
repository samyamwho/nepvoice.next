'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLogoutButton from './logout/page'; 
import Image from 'next/image';

const GOOGLE_LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENDPOINT;
console.log("Google Login Endpoint:", GOOGLE_LOGIN_ENDPOINT);

export const GoogleLoginButton = () => {
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
          <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Log in with Google
        </>
      )}
    </button>
  );
};

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);

  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    const token = searchParams.get('token');

    if (authSuccess === 'true' && token) {
      setIsVerifyingSession(true);
      localStorage.setItem('authToken', token);

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      router.push('/dashboard');
      setIsVerifyingSession(false); 
    }
  }, [router, searchParams]);

  const handleLogoutSuccess = () => {
    console.log("Logout successful");
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const handleLogoutError = (error: Error) => {
    console.error("Logout failed:", error.message);
  };

  if (isVerifyingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-black">Verifying Your Session</h2>
          <p className="text-sm text-gray-600">Please wait a moment...</p>
          <div className="flex justify-center items-center mt-4">
            <svg className="w-8 h-8 text-black animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-white">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-white opacity-0"></div>
      </div>

      <div className="w-5xl flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 relative z-10">
        <a href="#" className="flex items-center mb-6 text-2xl font-normal text-black font-[Avenir]">
          <Image src="/assets/NepVoice.png" alt="logo" width={150} height={50} />
        </a>
        <div className="w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0 backdrop-blur-sm border-1 border-gray-100 shadow-sm">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-normal leading-tight tracking-tight text-black md:text-2xl">
              Welcome back
            </h1>
            <p className="text-sm font-light text-gray-600">
              Continue with your Google account
            </p>
            <div className="space-y-4">
              <GoogleLoginButton />
              <GoogleLogoutButton
                onLogoutSuccess={handleLogoutSuccess}
                onLogoutError={handleLogoutError}
                className="w-full"
              />
            </div>
            <p className="text-sm font-light text-black">
              Don't have an account? <a href="/main/googleauth" className="font-medium hover:underline">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;