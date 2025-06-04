'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Download, Play, LayoutDashboard, TextCursor } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import Globalplayer from "@/components/shared/Globalplayer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAudio } from "@/context/AudioContext";
import TTSDashboard from "./TTSDashboard";

// Define interfaces for our data structures
interface Language {
  code: string;
  name: string;
  flag: string;
  language: string;
}

interface VoiceOption {
  id: string;
  name: string;
  quality: string;
}

interface HistoryItem {
  id: number;
  language: string;
  text: string;
  date: string;
  duration: string;
  voice: string;
  style: number;
  speed: number;
}

const LANGUAGES: Language[] = [
  { 
    code: "en", 
    name: "English", 
    flag: "/assets/gb.svg", 
    language: "english"
  },
  { 
    code: "ne", 
    name: "Nepali", 
    flag: "/assets/np.png", 
    language: "nepali"
  },
];

const VOICE_OPTIONS: VoiceOption[] = [
  { id: "voice1", name: "Voice 1 (Female, Natural)", quality: "Premium" },
  { id: "voice2", name: "Voice 2 (Male, Professional)", quality: "Premium" },
  { id: "voice3", name: "Voice 3 (Female, Casual)", quality: "Standard" },
  { id: "voice4", name: "Voice 4 (Male, Expressive)", quality: "Premium" },
  { id: "voice5", name: "Voice 5 (Female, Calm)", quality: "Standard" },
];

const SAMPLE_HISTORY: HistoryItem[] = [
  {
    id: 1,
    language: "en",
    text: "Welcome to NepVoice, the best text-to-speech platform for all your needs.",
    date: "2 hours ago",
    duration: "00:12",
    voice: "voice1",
    style: 0.5,
    speed: 1.0,
  },
  {
    id: 2,
    language: "ne",
    text: "नमस्कार, यो नेपाली भाषामा एक परीक्षण वाक्य हो।",
    date: "Yesterday",
    duration: "00:08",
    voice: "voice2",
    style: 0.5,
    speed: 1.0,
  },
  {
    id: 3,
    language: "en",
    text: "This is a demonstration of our advanced voice synthesis technology.",
    date: "May 10, 2025",
    duration: "00:15",
    voice: "voice3",
    style: 0.5,
    speed: 1.0,
  },
];

const TextToSpeech: React.FC = () => {
  // Audio context
  const { playAudio, pauseAudio, seekAudio, setVolume, isPlaying, currentTime, duration, volume, audioUrl, trackInfo } = useAudio();
  
  // Component state
  const [selectedLang, setSelectedLang] = useState<string>(LANGUAGES[0].code);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].id);
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "history">("settings");
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  // Refs
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguageObj = LANGUAGES.find(l => l.code === selectedLang);
  const history = SAMPLE_HISTORY;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    setTotalTime(calculateTotalTime(text));
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setVoiceDropdownOpen(false);
  };

  const handleFavorite = (item: HistoryItem) => {
    const isFavorite = favorites.some(
      (fav) => fav.text === item.text && fav.voice === item.voice
    );

    if (isFavorite) {
      setFavorites(favorites.filter(
        (fav) => !(fav.text === item.text && fav.voice === item.voice)
      ));
      toast.success('Removed from favorites');
    } else {
      setFavorites([...favorites, item]);
      toast.success('Added to favorites');
    }
  };
  
  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tts-audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      toast.info("No audio generated to download.");
    }
  };

  const calculateTotalTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = Math.ceil((words / 3) * (1 / speed));
    const minutes = Math.floor(estimatedSeconds / 60).toString().padStart(2, "0");
    const seconds = (estimatedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target as Node)) {
        setVoiceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast.info(message);
    }
  };

  const fetchAndPlayTTS = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_TTS_ENDPOINT}?text=${encodeURIComponent(inputText)}&lang=${selectedLanguageObj?.language}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch audio");
  
      const blob = await response.blob();
      const urlObject = URL.createObjectURL(blob);
      setAudioBlob(blob);
  
      playAudio(urlObject, {
        id: Date.now().toString(),
        title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
        speaker: selectedLanguageObj?.name,
        createdAt: new Date().toLocaleDateString(),
        audioUrl: urlObject
      });
    } catch (error) {
      showToast("Failed to generate audio. Please try again.", "error");
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to convert to speech');
      return;
    }

    if (inputText.length > 5000) {
      toast.error('Text is too long. Maximum 5000 characters allowed.');
      return;
    }

    try {
      await fetchAndPlayTTS();
      toast.success('Audio generated successfully');
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const handleHistoryPlay = async (item: HistoryItem) => {
    try {
      setInputText(item.text);
      setSelectedLang(item.language);
      setSelectedVoice(item.voice);
      setSpeed(item.speed);
      setCharCount(item.text.length);
      setWordCount(item.text.trim().split(/\s+/).filter(Boolean).length);
      setTotalTime(calculateTotalTime(item.text));
      
      await fetchAndPlayTTS();
      toast.success('Playing audio from history');
    } catch (error) {
      console.error('Error playing history item:', error);
      toast.error('Failed to play audio from history');
    }
  };

  const handleToggleDashboard = () => {
    setShowDashboard(prev => !prev);
  };

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-full overflow-hidden bg-white">
      <Sidebar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
        toastStyle={{ 
          minWidth: '200px',
          maxWidth: '300px',
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          marginTop: '0.5rem',
          marginRight: '0.5rem'
        }}
      />

      <div className="flex-1 flex flex-col h-full w-full overflow-y-auto p-0 md:p-0">
        <div className="w-full border-b bg-white border-gray-300 sticky top-0 z-20">
          <div className="px-4 py-3 md:px-12 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <TextCursor className="w-6 h-6 md:w-8 md:h-8 text-gray-800" />
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 font-custom">
                {showDashboard ? "Text to Speech Dashboard" : "Text to Speech"}
              </h1>
            </div>
            <button
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              onClick={handleToggleDashboard}
            >
              <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
              {showDashboard ? "Back to TTS" : "Dashboard"}
            </button>
          </div>
        </div>

        {showDashboard ? (
          <div className="flex-1 w-full h-full overflow-y-auto">
            <TTSDashboard />
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row w-full p-4 md:p-0">
            {/* Left Section: Text Input */}
            <div className="flex-1 md:flex-[2] flex flex-col items-start justify-start z-10 w-full md:p-6">
              <div className="w-full flex flex-col sm:flex-row justify-between mb-4 text-sm text-gray-600 font-custom">
                <div>Input Text</div>
                <div>
                  {charCount} characters · {wordCount} words · ~{totalTime} duration
                </div>
              </div>
              <div className="relative w-full h-[200px] sm:h-[300px] md:h-[calc(50vh_-_theme(spacing.6))] mb-6 md:mb-8">
                <textarea
                  className="w-full h-full bg-white border border-gray-300 text-black placeholder-gray-500 resize-none outline-none p-3 md:p-4 rounded-lg focus:border-blue-300 focus:ring-1 focus:ring-blue-300 font-custom text-sm md:text-base"
                  placeholder="Enter text to convert to speech..."
                  value={inputText}
                  onChange={handleTextChange}
                />
              </div>
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full p-4 md:p-4 shadow-lg hover:bg-gray-800 active:scale-95 active:brightness-90 transition-all flex items-center justify-center min-w-[56px] min-h-[56px]"
                    onClick={handleDownload}
                    title="Download audio"
                  >
                    <Download className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                  <button
                    className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg px-6 py-4 md:px-6 md:py-4 shadow-lg hover:bg-gray-800 active:scale-95 active:brightness-90 transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm md:text-base font-custom w-full sm:w-auto min-h-[56px] min-w-[56px] flex items-center justify-center"
                    onClick={handleGenerate}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section: Controls/History */}
            <div className="flex-1 md:flex-[1] flex flex-col items-start justify-start gap-4 md:gap-6 md:p-6 w-full md:border-l border-gray-300 mt-4 md:mt-0">
              <div className="w-full flex flex-row items-center justify-start border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-1">
                  <button
                    className={`px-4 py-2 md:px-6 md:py-3 text-base md:text-lg font-medium relative transition-all duration-200 font-custom ${
                      activeTab === "settings"
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    Settings
                  </button>
                  <button
                    className={`px-4 py-2 md:px-6 md:py-3 text-base md:text-lg font-medium relative transition-all duration-200 font-custom ${
                      activeTab === "history"
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    History
                  </button>
                </div>
              </div>

              <div className="w-full mt-2 md:mt-4 overflow-y-auto flex-1">
                {activeTab === "settings" && (
                  <div className="w-full space-y-4 md:space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Language & Voice
                      </h3>
                      <div className="space-y-6">
                        <div className="relative" ref={languageDropdownRef}>
                          <label className="block text-sm text-gray-700 mb-2 font-custom">Language</label>
                          <button
                            className="w-full flex items-center justify-between bg-white text-black rounded-lg px-3 py-2 md:px-4 md:py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 font-custom text-sm md:text-base"
                            onClick={() => setDropdownOpen((open) => !open)}
                            aria-haspopup="listbox"
                            aria-expanded={dropdownOpen}
                          >
                            <div className="flex items-center gap-2 md:gap-3">
                              <Image
                                src={selectedLanguageObj?.flag || ''}
                                alt={selectedLanguageObj?.name || ''}
                                width={24}
                                height={24}
                                className="rounded-full ring-2 ring-gray-100"
                              />
                              <span className="text-black font-custom">{selectedLanguageObj?.name}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {dropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {LANGUAGES.map((lang) => (
                                <button
                                  key={lang.code}
                                  className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 hover:bg-gray-50 transition-colors text-black font-custom text-sm md:text-base ${
                                    selectedLang === lang.code ? "bg-gray-100" : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedLang(lang.code);
                                    setDropdownOpen(false);
                                  }}
                                  role="option"
                                  aria-selected={selectedLang === lang.code}
                                >
                                  <Image
                                    src={lang.flag}
                                    alt={lang.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                  <span className="text-black font-custom">{lang.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={voiceDropdownRef}>
                          <label className="block text-sm text-gray-700 mb-2 font-custom">Voice</label>
                          <button
                            className="w-full flex items-center justify-between bg-white text-black rounded-lg px-3 py-2 md:px-4 md:py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 font-custom text-sm md:text-base"
                            onClick={() => setVoiceDropdownOpen(!voiceDropdownOpen)}
                          >
                            <span className="text-black font-custom">
                              {VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.name}
                            </span>
                            <svg
                              className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${voiceDropdownOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {voiceDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {VOICE_OPTIONS.map((voice) => (
                                <button
                                  key={voice.id}
                                  className={`w-full text-left px-3 py-2 md:px-4 md:py-3 hover:bg-gray-50 transition-colors text-black font-custom text-sm md:text-base ${
                                    selectedVoice === voice.id ? "bg-gray-100" : ""
                                  }`}
                                  onClick={() => {
                                    handleVoiceSelect(voice.id);
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-black font-custom">{voice.name}</span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{voice.quality}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="w-full space-y-3 md:space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <TextCursor className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm md:text-base font-medium">
                          No conversion history yet.
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm mt-2">
                          Your text-to-speech conversions will appear here
                        </p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          className="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Image
                                src={LANGUAGES.find((l) => l.code === item.language)?.flag || ''}
                                alt={LANGUAGES.find((l) => l.code === item.language)?.name || ''}
                                width={24}
                                height={24}
                                className="rounded-full ring-2 ring-gray-100"
                              />
                              <span className="font-medium text-black text-sm md:text-base font-custom">
                                {LANGUAGES.find((l) => l.code === item.language)?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                                onClick={() => handleFavorite(item)}
                                aria-label={favorites.some(f => f.text === item.text && f.voice === item.voice) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <svg
                                  className="w-4 h-4 md:w-5 md:h-5"
                                  fill={favorites.some(f => f.text === item.text && f.voice === item.voice) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
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
                          <p className="text-gray-700 mb-4 line-clamp-2 text-sm md:text-base font-custom">
                            {item.text}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full font-custom">
                              {item.date} · {item.duration}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[36px] min-h-[36px] hover:shadow-md"
                                onClick={() => handleHistoryPlay(item)}
                                aria-label="Play history item"
                              >
                                <Play className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                              <button
                                className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[36px] min-h-[36px] hover:shadow-md"
                                onClick={() => handleDownload()}
                                aria-label="Download history item"
                              >
                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Globalplayer
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={() => {
          if (audioUrl) {
            if (isPlaying) {
              pauseAudio();
            } else {
              playAudio(audioUrl, trackInfo || {
                id: Date.now().toString(),
                title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
                speaker: selectedLanguageObj?.name,
                audioUrl: audioUrl
              });
            }
          } else if (inputText.trim()) {
            fetchAndPlayTTS();
          }
        }}
        onSeek={(percent) => {
          if (typeof duration === 'number' && duration > 0 && audioUrl) {
            const timeInSeconds = (percent / 100) * duration;
            if (!isNaN(timeInSeconds)) seekAudio(timeInSeconds);
          }
        }}
        onVolumeChange={setVolume}
        onForward={() => {
          if (typeof currentTime === 'number' && typeof duration === 'number' && audioUrl) {
            const newTime = Math.min(currentTime + 10, duration);
            if (!isNaN(newTime)) seekAudio(newTime);
          }
        }}
        onBackward={() => {
          if (typeof currentTime === 'number' && audioUrl) {
            const newTime = Math.max(currentTime - 10, 0);
            if (!isNaN(newTime)) seekAudio(newTime);
          }
        }}
        trackInfo={trackInfo || {
          id: Date.now().toString(),
          title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
          speaker: selectedLanguageObj?.name,
          audioUrl: audioUrl || ''
        }}
      />
    </div>
  );
};

export default TextToSpeech;