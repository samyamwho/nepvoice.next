'use client';

import { useState, useEffect } from "react";
import {
  Home,
  MessageCircle,
  PlusCircle,
  TextCursor,
  Music,
  FileAudio,
  ChevronDown,
  Bell,
  BookOpen,
  Captions,
  PhoneCall,
  Key,
  Wallet,
  Menu,
  X,
  User,
  FilePen,
} from "lucide-react";
import { useProfile } from "@/components/Auth/CurrentProfile";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [audioToolsExpanded, setAudioToolsExpanded] = useState(false);
  const [userMenuExpanded, setUserMenuExpanded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1080) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        if (mobileOpen) {
          setMobileOpen(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const getDisplayName = () => {
    if (profileLoading) return "USER";
    if (profileError || !profile?.name) return "USER";
    return profile.name;
  };

  const handleUserMenuClick = (tab: string) => {
    router.push(`/main/profile?tab=${tab}`);
    setUserMenuExpanded(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <div
        className={`md:hidden fixed top-4 z-[10000] text-black 
                    ${mobileOpen ? "right-4" : "left-4"}`}
      >
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`flex flex-col font-[Avenir] z-[9999] bg-white text-black border-r border-gray-300 transition-all duration-300 
        ${mobileOpen ? "fixed inset-0 w-full h-screen pt-16" : "hidden md:flex"} 
        ${!mobileOpen && collapsed ? "w-16" : "w-64"}`}
      >
        {/* Logo and Collapse Button */}
        <div className={`flex items-center px-4 py-5 ${mobileOpen ? 'justify-center' : 'justify-between'}`}>
          <Link href="/" className={mobileOpen && !collapsed ? '' : ''}>
            {(!collapsed || mobileOpen) && (
              <Image
                src="/assets/NepVoice.png"
                alt="NepVoice"
                width={150}
                height={150}
                priority
              />
            )}
          </Link>
          <button
            className="p-1 border border-gray-300 rounded hover:bg-gray-100 md:block hidden"
            onClick={toggleCollapse}
          >
            <BookOpen size={16} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {/* Home */}
            <li>
              <Link
                href="/main/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                  collapsed && !mobileOpen ? "justify-center" : ""
                }`}
              >
                <Home size={20} />
                {(!collapsed || mobileOpen) && <span>Home</span>}
              </Link>
            </li>

            {/* Voices */}
            <li>
              <div
                className={`flex items-center ${
                  collapsed && !mobileOpen
                    ? "justify-center"
                    : "justify-between"
                } px-3 py-2 rounded-md hover:bg-gray-100`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} />
                  {(!collapsed || mobileOpen) && <span>Voices</span>}
                </div>
                {(!collapsed || mobileOpen) && <PlusCircle size={18} />}
              </div>
            </li>
          </ul>

          {/* Playground Section */}
          <div className="mt-6">
            {(!collapsed || mobileOpen) && (
              <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">
                Playground
              </h2>
            )}
            <ul className="space-y-1 px-2">
              <li>
                <Link
                  href="/main/texttospeech"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <TextCursor size={20} />
                  {(!collapsed || mobileOpen) && <span>Text to Speech</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/main/docassist"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <FilePen size={20} />
                  {(!collapsed || mobileOpen) && <span>Doc Assistant</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/main/speechtotext"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <FileAudio size={20} />
                  {(!collapsed || mobileOpen) && <span>Speech to Text</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/main/youtubetranscriber"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <Captions size={20} />
                  {(!collapsed || mobileOpen) && (
                    <span>Youtube Transcriber</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/main/voicecall"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <PhoneCall size={20} />
                  {(!collapsed || mobileOpen) && <span>Voice Call</span>}
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Section */}
          <div className="mt-6">
            {(!collapsed || mobileOpen) && (
              <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">
                Products
              </h2>
            )}
            <ul className="space-y-1 px-2">
              <li>
                <button
                  onClick={() => router.push('/main/profile?tab=api-keys')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 w-full text-left ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <Key size={20} />
                  {(!collapsed || mobileOpen) && <span>API Keys</span>}
                </button>
              </li>
              <li>
                <Link
                  href="/main/price"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
                    collapsed && !mobileOpen ? "justify-center" : ""
                  }`}
                >
                  <Wallet size={20} />
                  {(!collapsed || mobileOpen) && <span>Pricing</span>}
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-10 border-t border-gray-200">
          {(!collapsed || mobileOpen) && (
            <>
              <button
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-100"
                onClick={() => setAudioToolsExpanded(!audioToolsExpanded)}
              >
                <div className="flex items-center gap-3">
                  <Music size={20} />
                  <span>Audio Tools</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`${audioToolsExpanded ? "rotate-180" : ""} transform transition-transform`}
                />
              </button>

              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
              >
                <Bell size={20} />
                <span>Notifications</span>
              </Link>
            </>
          )}

          {collapsed && !mobileOpen ? (
            <div className="py-3 flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="User"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-400" />
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => setUserMenuExpanded(!userMenuExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="User"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm">{getDisplayName()}</div>
                    <div className="text-xs text-gray-500">My Workspace</div>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`${userMenuExpanded ? "rotate-180" : ""} transform transition-transform`}
                />
              </div>

              {userMenuExpanded && (
                <div className="absolute bottom-full mb-2 right-0 left-0 sm:left-auto sm:w-64 bg-white border border-gray-300 shadow-lg rounded-md py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700">Credits</div>
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">Free Plan</div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-gray-600">
                            Usage
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-gray-600">
                            6.4%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                        <div style={{ width: "6.4%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600"></div>
                      </div>
                    </div>

                    {/* Credits Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-sm font-medium text-gray-800">10,000</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Remaining</div>
                        <div className="text-sm font-medium text-gray-800">9,360</div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="mt-3 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Used this month</span>
                        <span className="font-medium text-gray-700">640 credits</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Resets in</span>
                        <span className="font-medium text-gray-700">15 days</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => handleUserMenuClick('profile')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Profile</button>
                    <button onClick={() => handleUserMenuClick('api-keys')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">API Keys</button>
                    <button onClick={() => handleUserMenuClick('webhooks')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Webhooks</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600">Sign out</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;