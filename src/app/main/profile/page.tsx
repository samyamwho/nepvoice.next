"use client";

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Info, Sun, KeyRound, User, Link2, Upload, Copy, Eye, EyeOff, Trash2, RotateCw } from 'lucide-react';
import { useProfile } from '@/app/(auth)/CurrentProfile';
import Image from 'next/image';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const searchParams = useSearchParams();
  const { profile, isLoading: profileLoading, error: profileError } = useProfile();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<{[key: string]: boolean}>({});
  const [isDeletingKey, setIsDeletingKey] = useState<number | null>(null); // To show loading state on specific key

  // ... (getDisplayName, getDisplayEmail, handleImageUpload, copyToClipboard, ApiKeyGeneratedToast - no changes needed here) ...
  const getDisplayName = () => {
    if (profileLoading) return "USER";
    if (profileError || !profile?.name) return "USER";
    return profile.name;
  };

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
        const imageData = reader.result;
        if (typeof imageData === 'string') {
          setProfileImage(imageData);
          if (typeof window !== 'undefined') {
            localStorage.setItem('profileImage', imageData);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, source: string = "list") => {
    navigator.clipboard.writeText(text).then(() => {
      if (source === "toast") {
        toast.success('Key copied from toast!', { autoClose: 2000 });
      } else {
        toast.success('API key copied to clipboard!', { autoClose: 2000 });
      }
    }).catch(() => {
      toast.error('Failed to copy API key');
    });
  };

  const ApiKeyGeneratedToast = ({ apiKey, apiKeyMessage }: { apiKey: string, apiKeyMessage?: string }) => (
    <div>
      <p className="font-semibold mb-1">API Key Generated!</p>
      {apiKeyMessage && <p className="text-sm mb-1">Label: {apiKeyMessage}</p>}
      <p className="text-sm font-mono break-all mb-2">
        {maskApiKey(apiKey)}
      </p>
      <p className="text-xs text-gray-600 mb-2">
        The full key has been added to the list below and is visible.
        <strong> Remember to store it securely.</strong>
      </p>
      <button
        onClick={() => copyToClipboard(apiKey, "toast")}
        className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded mt-1 inline-flex items-center"
      >
        <Copy size={14} className="mr-1" /> Copy Full Key
      </button>
    </div>
  );

  const fetchApiKeys = useCallback(async (showToastOnSuccess = false) => {
    setIsLoadingApiKeys(true);
    const endpoint = process.env.NEXT_PUBLIC_API_KEY_VIEW_ENDPOINT;
    if (!endpoint) {
      toast.error('API key viewing endpoint not configured.');
      setIsLoadingApiKeys(false);
      setApiKeysLoaded(true); 
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const formattedKeys = data.map((apiKeyFromServer: any) => ({
          id: apiKeyFromServer.id,
          key: apiKeyFromServer.api_key,
          message: `Key ID: ${apiKeyFromServer.id}`, 
          createdAt: apiKeyFromServer.created_on, 
          lastUsed: 'N/A', 
        }));
        setApiKeys(formattedKeys);
        setApiKeysLoaded(true);
        if (showToastOnSuccess) {
            toast.success('API Keys refreshed successfully!');
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch API keys:', response.status, errorData);
        toast.error(`Failed to load API keys. Server: ${response.status}.`);
        setApiKeysLoaded(true); 
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys. Check console for details.');
      setApiKeysLoaded(true); 
    } finally {
      setIsLoadingApiKeys(false);
    }
  }, []); 

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'api-keys', 'webhooks'].includes(tab)) {
      setActiveTab(tab);
    }
    // No direct fetchApiKeys here, moved to the next useEffect for clarity
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [searchParams]); 

  // Effect to fetch keys when API tab becomes active, if not already loaded
  useEffect(() => {
    if (activeTab === 'api-keys' && !apiKeysLoaded && !isLoadingApiKeys) {
      fetchApiKeys();
    }
  }, [activeTab, apiKeysLoaded, isLoadingApiKeys, fetchApiKeys]);


  const generateApiKey = async () => {
    setIsGenerating(true);
    try {
      const endpoint = process.env.NEXT_PUBLIC_API_KEY_GENERATION_ENDPOINT;
      if (!endpoint) {
        // ... (simulation logic - kept for brevity) ...
        console.warn('API endpoint not configured. Simulating API key generation.');
        const mockApiKey = `test_key_${Date.now().toString(36)}`;
        const mockMessage = `Test Key ${apiKeys.length + 1}`;
        const newApiKeyObject = {
          id: Date.now(),
          key: mockApiKey,
          message: mockMessage,
          createdAt: new Date().toISOString(),
          lastUsed: 'Never'
        };
        setApiKeys(prev => [newApiKeyObject, ...prev]); 
        setVisibleKeys(prev => ({ ...prev, [newApiKeyObject.id]: true }));
        toast.success(
          <ApiKeyGeneratedToast apiKey={mockApiKey} apiKeyMessage={mockMessage} />, 
          { autoClose: 10000, closeOnClick: false }
        );
        setIsGenerating(false);
        return; 
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json(); 
        const newApiKeyObject = {
          id: data.id || Date.now(), 
          key: data.api_key,
          message: data.message || `Generated Key (${new Date().toLocaleTimeString()})`,
          createdAt: data.created_on || new Date().toISOString(), 
          lastUsed: 'Never'
        };
        setApiKeys(prev => [newApiKeyObject, ...prev]);
        setVisibleKeys(prev => ({ ...prev, [newApiKeyObject.id]: true }));
        
        toast.success(
          <ApiKeyGeneratedToast apiKey={data.api_key} apiKeyMessage={newApiKeyObject.message} />, 
          { autoClose: 10000, closeOnClick: false, draggable: true }
        );
        
      } else {
        const errorData = await response.text();
        console.error('Failed to generate API key:', response.status, errorData);
        toast.error(`Failed to generate API key. Server: ${response.status}. See console.`);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

    const deleteApiKey = async (keyIdToDelete: number) => {
    const endpointTemplate = process.env.NEXT_PUBLIC_API_KEY_DELETE_ENDPOINT;

    if (!endpointTemplate) {
      toast.error('API key deletion endpoint not configured.');
      return;
    }
    
    const deleteEndpoint = endpointTemplate.replace(/{key_id}|:key_id/i, keyIdToDelete.toString());

    if (confirm(`Are you sure you want to revoke API key ID: ${keyIdToDelete}? This action cannot be undone.`)) {
      setIsDeletingKey(keyIdToDelete); 
      // It's generally better to update the UI *after* successful server confirmation,
      // but keeping oldKeys for rollback is good.
      const oldKeys = [...apiKeys]; 

      try {
        const response = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json', 
          },
          credentials: 'include', 
        });

        if (response.ok) {
          // Attempt to get the message from the response body for the toast
          let successMessage = `API Key ID: ${keyIdToDelete} revoked successfully!`;
          try {
            const responseData = await response.json();
            successMessage = responseData.message || successMessage;
          } catch (e) {
            // Not a JSON response, or JSON parsing failed, use default message
            console.warn("Could not parse success response JSON for delete, using default message.", e);
          }
          
          // CRITICAL: Update the state *before* showing the success toast,
          // or ensure the toast rendering doesn't block/delay the state update's effect.
          // Using the functional update form of setState is generally safer for updates based on previous state.
          setApiKeys(prevApiKeys => prevApiKeys.filter(key => key.id !== keyIdToDelete));
          
          toast.success(successMessage); // Show toast *after* state update has been queued

        } else {
          let errorMessage = `Failed to revoke API key. Server responded with ${response.status}.`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            const errorBodyText = await response.text().catch(() => "Could not read error body.");
            errorMessage = response.statusText ? `${errorMessage} ${response.statusText}` : errorMessage;
            if (errorBodyText && errorBodyText !== "Could not read error body.") {
                 errorMessage += ` - Body: ${errorBodyText.substring(0,100)}`;
            }
          }
          console.error('Error revoking API key:', response.status, errorMessage);
          toast.error(errorMessage);
          // No need to setApiKeys(oldKeys) here if we didn't optimistically update
        }
      } catch (error) {
        console.error('Network or other error revoking API key:', error);
        toast.error('An error occurred while revoking the API key. Please try again.');
        // No need to setApiKeys(oldKeys) here
      } finally {
        setIsDeletingKey(null); 
      }
    }
  };


  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 12) return key; 
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
  };

  const filteredKeys = apiKeys.filter(key => {
    const searchTermLower = searchTerm.toLowerCase();
    const keyStringLower = key.key ? key.key.toLowerCase() : '';
    const messageLower = key.message ? key.message.toLowerCase() : '';
    return keyStringLower.includes(searchTermLower) || messageLower.includes(searchTermLower);
  });

  const ProfileTab = () => (
    // ... (Your existing ProfileTab code - no changes)
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-600" /> Profile
        </h3>
        <div className="mb-6 flex flex-col items-start gap-6">
          <div className="flex flex-col items-start">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={96}
                  height={96}
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
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-gray-600" /> API Keys
            </h3>
            <button
                onClick={() => fetchApiKeys(true)} 
                disabled={isLoadingApiKeys || isGenerating || !!isDeletingKey}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh API Keys"
            >
                <RotateCw size={18} className={isLoadingApiKeys ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by key or label..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-xs border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-700"
          />
          <button 
            onClick={generateApiKey}
            disabled={isGenerating || isLoadingApiKeys || !!isDeletingKey}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-black transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            <KeyRound className="h-4 w-4" /> 
            {isGenerating ? 'Generating...' : 'Create API Key'}
          </button>
        </div>
        
        {isLoadingApiKeys && !apiKeys.length ? ( 
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <RotateCw size={32} className="animate-spin mb-3" />
            <p>Loading API Keys...</p>
          </div>
        ) : !isLoadingApiKeys && apiKeysLoaded && filteredKeys.length === 0 && !searchTerm ? ( 
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <KeyRound className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-700 mb-1">No API Keys Yet</p>
            <p className="text-gray-500 text-sm">Click "Create API Key" to generate your first key.</p>
          </div>
        ) : !isLoadingApiKeys && apiKeysLoaded && filteredKeys.length === 0 && searchTerm ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700 mb-1">No API Keys Found</p>
                <p className="text-gray-500 text-sm">Your search for "{searchTerm}" did not match any API keys.</p>
            </div>
        ) : (
          <div className="space-y-3 mb-4">
            {filteredKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 mb-3 sm:mb-0">
                    {apiKey.message && (
                      <h5 className="font-semibold text-gray-700 mb-1 break-all">{apiKey.message}</h5>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono text-sm bg-white px-3 py-1.5 rounded border border-gray-300 break-all ${visibleKeys[apiKey.id] ? 'text-gray-800' : 'text-gray-500'}`}>
                        {visibleKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </span>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        disabled={isDeletingKey === apiKey.id}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                        title={visibleKeys[apiKey.id] ? 'Hide key' : 'Show key'}
                      >
                        {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        disabled={isDeletingKey === apiKey.id}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Created: {new Date(apiKey.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <p>Last used: {apiKey.lastUsed}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    disabled={isDeletingKey === apiKey.id || isLoadingApiKeys || isGenerating}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors self-start sm:ml-4 disabled:opacity-50 disabled:cursor-wait"
                    title="Revoke API key"
                  >
                    {isDeletingKey === apiKey.id ? (
                        <RotateCw size={16} className="animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-gray-600 text-sm mt-6 pt-4 border-t border-gray-200">
          <p className="leading-relaxed">
            API keys allow you to authenticate with our services programmatically. Treat them like passwords and keep them secure.
            You can create multiple API keys, for example, one for each application or specific purpose. For more details, consult the{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">API documentation</a>.
          </p>
        </div>
      </div>
    </div>
  );

  const WebhooksTab = () => (
    // ... (Your existing WebhooksTab code)
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
          <p className="text-gray-500 text-sm">You have not configured any webhooks yet. Click CREATE WEBHOOK to add one.</p>
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
      />
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
            <Sun size={18} className="text-white" />
          </button>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-500 mb-6">Manage your profile, API keys and webhooks.</p>
          <div className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="inline-block mr-2 h-5 w-5 align-text-bottom" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative whitespace-nowrap ${
                activeTab === 'api-keys'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <KeyRound className="inline-block mr-2 h-5 w-5 align-text-bottom" /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-3 px-4 font-medium text-base transition-all duration-200 relative whitespace-nowrap ${
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

const SettingsPage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-gray-700 text-xl ml-4">Loading settings...</p>
      </div>
    }>
      <SettingsView />
    </Suspense>
  );
};

export default SettingsPage;