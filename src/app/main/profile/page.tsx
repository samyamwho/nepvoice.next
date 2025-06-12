"use client"; // Mark as a client component

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Replace useLocation// Adjust path as needed
import { ChevronRight, Info, Sun, KeyRound, User, Link2, Upload } from 'lucide-react';
import { useProfile } from '@/app/(auth)/CurrentProfile'; // Adjust path as needed

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const searchParams = useSearchParams(); // Use Next.js search params for tab state
  const { profile, isLoading : profileLoading ,  error: profileError } = useProfile();
  const [profileImage, setProfileImage] = useState<string | null>(null);
    
  const getDisplayName = () => {
    if (profileLoading) return "USER";
    if (profileError || !profile?.name) return "USER";
    return profile.name;
  };



  // Handle activeTab from query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'api-keys', 'webhooks'].includes(tab)) {
      setActiveTab(tab);
    }

    // Handle profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [searchParams]);

  const getDisplayEmail = () => {
    if (profileLoading) return "USER_EMAIL";
    if (profileError || !profile?.email) return "USER_EMAIL";
    return profile.email;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tab content components
  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-600" /> Profile
        </h3>
        {/* Profile Info Section: Username & Profile Picture stacked */}
        <div className="mb-6 flex flex-col items-start gap-6">
          {/* Profile Picture & Upload */}
          <div className="flex flex-col items-start">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="cursor-pointer mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                <Upload className="w-4 h-4" />
                <span>Upload new picture</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
            <div className="text-xl font-semibold text-gray-900">{getDisplayName()}</div>

        </div>
        <div className="mb-4">
          <h4 className="font-medium text-gray-700">E-Mail Address</h4>
          <p className="text-gray-500">{getDisplayEmail()}</p>
        </div>
        <div className="mb-4">
          <h4 className="font-medium text-gray-700">Current Plan</h4>
          <p className="text-gray-500">Free</p>
          <div className="mt-2">
            <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-black transition-all font-medium">
              Manage Subscription
            </button>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-red-500">Delete Account</h4>
          <p className="text-gray-500 mt-1">
            Deleting your account is permanent. You will no longer be able to create an account with this email.
          </p>
          <div className="mt-2">
            <button className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 font-medium transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ApiKeysTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-gray-600" /> API Keys
        </h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Search your API Keys..."
            className="w-full md:max-w-xs border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-700"
          />
          <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-black transition-all font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Create API Key
          </button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3 text-black">
            <Info className="mt-2" />
            <div>
              <p className="font-medium text-gray-700">API Keys Missing</p>
              <p className="text-gray-500">No User API keys have been created yet.</p>
            </div>
          </div>
        </div>
        <div className="text-gray-600 text-sm">
          <p>
            An API key allows you to authenticate with our API and access its functionalities programmatically.
            You can create multiple API keys with different permissions. For more information, please refer to the{' '}
            <a href="#" className="text-blue-600 hover:underline">API documentation</a>.
          </p>
        </div>
      </div>
    </div>
  );

  const WebhooksTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-gray-600" /> Webhooks
        </h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h4 className="font-medium text-gray-700">Webhooks</h4>
            <p className="text-gray-500 text-sm">Create and configure webhooks to enable callbacks from NepVoice to an external system.</p>
          </div>
          <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-black transition-all font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Create Webhook
          </button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <p className="font-medium text-gray-700">No Webhooks Configured</p>
          <p className="text-gray-500 text-sm">You have not configured any webhooks yet. Click "Create Webhook" to add one.</p>
        </div>
        <div className="mb-4">
          <h4 className="font-medium text-gray-700">Webhooks Events</h4>
          <p className="text-gray-500 text-sm">Configure webhooks to listen for events.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h5 className="font-medium text-gray-700">Voice Removal Notice Webhook</h5>
              <p className="text-gray-500 text-sm">Select the webhook that will be called when a voice in use is scheduled for removal.</p>
            </div>
            <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-black transition-all font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Select Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'api-keys':
        return <ApiKeysTab />;
      case 'webhooks':
        return <WebhooksTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 rounded-full p-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black text-white">New</span>
            </div>
            <span className="text-sm text-black">Creating your Professional Voice Clone just got easier</span>
            <ChevronRight size={16} />
          </div>
          <button className="rounded-full p-2 hover:bg-gray-100 bg-black">
            <Sun size={18} />
          </button>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-500 mb-6">Manage your profile, API keys and webhooks.</p>
          <div className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative ${
                activeTab === 'profile'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="inline-block mr-2 h-5 w-5 align-text-bottom" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative ${
                activeTab === 'api-keys'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <KeyRound className="inline-block mr-2 h-5 w-5 align-text-bottom" /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative ${
                activeTab === 'webhooks'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link2 className="inline-block mr-2 h-5 w-5 align-text-bottom" /> Webhooks
            </button>
          </div>
          <div>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;