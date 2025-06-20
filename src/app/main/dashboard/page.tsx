"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  TextCursor,
  Stethoscope,
  FileAudio,
  BookHeadphones,
  Captions,
  PhoneCall,
  Play,
  Download,
} from "lucide-react";
import { useProfile } from '@/app/(auth)/CurrentProfile';


const LANGUAGES = [
  { code: "en", name: "English", flag: "/assets/gb.png" },
  { code: "ne", name: "Nepali", flag: "/assets/np.png"},
];

const initialHistoryData = [
  {
    id: "1",
    language: "en",
    text: "Hello, this is a sample text that has been processed. It's a bit long to show how line clamp works effectively.",
    date: "May 20, 2024",
    duration: "0:32",
    isFavorite: false,
    audioUrl: "#"
  },
  {
    id: "2",
    language: "ne",
    text: "नमस्ते, यो प्रशोधन गरिएको नमूना पाठ हो। यो अलि लामो छ कि कसरी लाइन क्ल्याम्पले प्रभावकारी रूपमा काम गर्दछ भनेर देखाउन। आशा छ यो उपयोगी छ।",
    date: "May 18, 2024",
    duration: "1:05",
    isFavorite: false,
    audioUrl: "#"
  },
];


interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  description?: string;
}

const FeatureCard = ({ title, icon, color, href, description }: FeatureCardProps) => {
  return (
    <Link
      href={href}
      className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow h-full"
    >
      <div className="flex flex-col items-center justify-center text-center gap-2 h-full">
        <div className={`rounded-full w-12 h-12 ${color} flex items-center justify-center mb-2 flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-sm font-medium font-custom">{title}</span>
        {description && <p className="text-xs text-gray-500 mt-1 font-custom">{description}</p>}
      </div>
    </Link>
  );
};

const playgroundFeatureCards = [
  { title: "Text to Speech", href: "/main/texttospeech", icon: <TextCursor size={24} className="text-blue-600" />, color: "bg-blue-100", description: "Convert text into natural voice." },
  { title: "Doc Assistant", href: "/main/docassist", icon: <Stethoscope size={24} className="text-indigo-600" />, color: "bg-indigo-100", description: "Voice-enable your documents." },
  { title: "Speech to Text", href: "/main/speechtotext", icon: <FileAudio size={24} className="text-purple-600" />, color: "bg-purple-100", description: "Transcribe audio to text." },
  { title: "Audio Book Creator", href: "/audio-book", icon: <BookHeadphones size={24} className="text-red-600" />, color: "bg-red-100", description: "Turn text into audiobooks." },
  { title: "Youtube Transcriber", href: "/youtubetranscribe", icon: <Captions size={24} className="text-orange-600" />, color: "bg-orange-100", description: "Transcribe YouTube videos." },
  { title: "Real-time Voice Call", href: "/main/voicecall", icon: <PhoneCall size={24} className="text-green-600" />, color: "bg-green-100", description: "Engage with AI voice calls." },
];


const Dashboard = () => {
  const { profile } = useProfile();

  const [historyItems] = useState(initialHistoryData);
  const [favorites, setFavorites] = useState<string[]>(
    initialHistoryData.filter(item => item.isFavorite).map(item => item.id)
  );
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<"all" | "favorites">("all");

  const toggleFavorite = (itemId: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(itemId)
        ? prevFavorites.filter((id) => id !== itemId)
        : [...prevFavorites, itemId]
    );
  };

  const filteredHistory = useMemo(() => {
    if (activeHistoryFilter === "favorites") {
      return historyItems.filter((item) => favorites.includes(item.id));
    }
    return historyItems;
  }, [historyItems, favorites, activeHistoryFilter]);

  const handlePlay = (audioUrl: string) => {
    console.log("Playing audio:", audioUrl);
  };
  const handleDownload = (audioUrl: string) => {
    console.log("Downloading audio:", audioUrl);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getDisplayName = () => {
    if (!profile?.name) return "USER";
    return profile.name;
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-y-auto">
      <div className="flex-1 flex flex-col overflow-y-auto pt-16 md:pt-0">

        <main className="p-6 space-y-8">
          <div>
            <div className="text-sm text-gray-600 font-custom">My Workspace</div>
            <h1 className="text-2xl font-bold text-black font-custom">
              {getTimeBasedGreeting()}, {getDisplayName()}!
            </h1>
          </div>

          <div>
              <h2 className="text-lg font-semibold mb-4 text-black font-custom">Explore Playground Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-900">
              {playgroundFeatureCards.map((card, index) => (
                  <FeatureCard key={index} {...card} />
              ))}
              </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-black font-custom">Recent Activity</h2>
            <div className="w-full space-y-3 md:space-y-4">
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                <button
                  onClick={() => setActiveHistoryFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-custom ${
                    activeHistoryFilter === "all"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveHistoryFilter("favorites")}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-custom ${
                    activeHistoryFilter === "favorites"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Favorites ({favorites.length})
                </button>
              </div>

              {filteredHistory.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                  {filteredHistory.map((item) => {
                      const languageInfo = LANGUAGES.find((l) => l.code === item.language);
                      return (
                      <div
                          key={item.id}
                          className="w-full bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                          <div className="flex items-center justify-between mb-1 md:mb-2">
                          <div className="flex items-center gap-1 md:gap-2">
                              {languageInfo && (
                              <Image
                                  src={languageInfo.flag}
                                  alt={`${languageInfo.name} flag`}
                                  width={20}
                                  height={20}
                                  className="w-4 h-4 md:w-5 md:h-5 rounded-full object-cover"
                              />
                              )}
                              <span className="font-medium text-black text-sm md:text-base font-custom">
                              {languageInfo?.name || item.language.toUpperCase()}
                              </span>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                              <button
                              className="text-gray-400 hover:text-yellow-500 p-1"
                              onClick={() => toggleFavorite(item.id)}
                              aria-label={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
                              >
                              <svg
                                  className="w-4 h-4 md:w-5 md:h-5"
                                  fill={favorites.includes(item.id) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                  <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                              </svg>
                              </button>
                          </div>
                          </div>
                          <p className="text-gray-700 mb-2 md:mb-3 line-clamp-2 text-sm md:text-base font-custom">
                          {item.text}
                          </p>
                          <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm text-gray-500 font-custom">
                              {item.date} · {item.duration}
                          </span>
                          <div className="flex items-center gap-1 md:gap-2">
                              <button
                                  onClick={() => handlePlay(item.audioUrl)}
                                  className="bg-black text-white rounded-full p-1.5 md:p-2 shadow-md hover:bg-gray-800 transition-colors min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                                  aria-label="Play history item"
                              >
                              <Play className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                              <button
                                  onClick={() => handleDownload(item.audioUrl)}
                                  className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full p-1.5 md:p-2 shadow-md hover:from-gray-600 hover:to-gray-800 transition-all min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                                  aria-label="Download history item"
                              >
                              <Download className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                          </div>
                          </div>
                      </div>
                      );
                  })}
                  </div>
              ) : (
                  <div className="text-center text-gray-500 py-8 font-custom">
                      No {activeHistoryFilter === "favorites" ? "favorite " : ""}items found.
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;