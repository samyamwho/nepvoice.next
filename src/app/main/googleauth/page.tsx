'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import GoogleLogoutButton from './logout/page';
import Image from 'next/image';

const GOOGLE_LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENDPOINT;

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
          Logging in...
        </span>
      ) : (
        <>
          Log in with Google
        </>
      )}
    </button>
  );
};

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isVerifyingSession, setIsVerifyingSession] = useState(
    () => searchParams.get('auth_success') === 'true'
  );

  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const shouldBeVerifyingCurrent = authSuccess === 'true';
    if (shouldBeVerifyingCurrent !== isVerifyingSession) {
      setIsVerifyingSession(shouldBeVerifyingCurrent);
    }

    if (authSuccess === 'true') {
      if (token) {
        localStorage.setItem('authToken', token);
      }
      router.replace('/dashboard');
    } else if (error) {
      console.error(`LoginForm useEffect: OAuth Error. Error: ${error}, Description: ${errorDescription}`);
      router.replace(pathname, { shallow: true });
      if (isVerifyingSession) {
        setIsVerifyingSession(false);
      }
    } else {
      if (isVerifyingSession) {
        setIsVerifyingSession(false);
      }
    }
  }, [router, searchParams, pathname, isVerifyingSession]);

  const handleLogoutSuccess = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const handleLogoutError = (error: Error) => {
    console.error("Logout failed from LoginForm:", error.message);
  };

  if (isVerifyingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-black">Verifying Your Session</h2>
          <p className="text-sm text-gray-600">Please wait a moment...</p>
          <div className="flex justify-center items-center mt-4">
            <span className="text-black">Loading...</span>
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
        <Link href="/" className="flex items-center mb-6 text-2xl font-normal text-black font-[Avenir]">
          <Image
            src="/assets/NepVoice.png"
            alt="logo"
            width={150}
            height={50}
            priority
          />
        </Link>
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
              Do not have an account? <Link href="/main/googleauth" className="font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;