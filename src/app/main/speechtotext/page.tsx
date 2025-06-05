"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Download, Mic, FileAudio, Square, Play, Trash2, ChevronRight, BarChart2 } from "lucide-react";
import { useAudio } from '@/components/context/AudioContext';
import Globalplayer from '@/components/shared/Globalplayer';
import { toast } from 'react-toastify';
import SpeechDashboard from "./speechdashboard";

interface Language {
  code: string;
  name: string;
  flag: string;
  language: string;
}

interface HistoryItem {
  id: number;
  language: string;
  flag: string;
  text: string;
  timestamp: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "/gb.svg", language: "english" },
  { code: "ne", name: "Nepali", flag: "/np.png", language: "nepali" },
];

const ASR_ENDPOINT = process.env.NEXT_PUBLIC_ASR_ENDPOINT as string;

const AudioTranscriberPage = (): JSX.Element => {
  const [selectedLang, setSelectedLang] = useState<string>(LANGUAGES[0].code);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const transcriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const selectedLanguage = LANGUAGES.find((l) => l.code === selectedLang);
  const [activeTab, setActiveTab] = useState<string>("history");

  const { playAudio, pauseAudio, isPlaying: globalIsPlaying, audioUrl: globalAudioUrl, trackInfo: globalTrackInfo, seekAudio, currentTime, duration, volume } = useAudio();

  const [history] = useState<HistoryItem[]>([
    {
      id: 1,
      language: "en",
      flag: "/gb.svg",
      text: "Hello, this is a sample text that was converted to speech.",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      language: "ne",
      flag: "/np.png",
      text: "नमस्ते, यो नेपाली भाषामा नमुना पाठ हो।",
      timestamp: "1 day ago",
    },
  ]);

  const [settings, setSettings] = useState({
    autoSave: true,
    darkMode: false,
    notifications: true,
    language: "en"
  });

  const startRecording = async (): Promise<void> => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlobRes = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlobRes);
          setAudioUrl(url);
          setAudioBlob(audioBlobRes);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setTranscriptionText("");
      } catch (error) {
        console.error("Error starting recording:", error);
        toast.error("Failed to access microphone. Please ensure microphone permissions are granted.");
      }
    } else {
      toast.error("Media devices are not supported in this environment.");
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = (): void => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
      setTranscriptionText("");
      if (globalAudioUrl === audioUrl) {
        pauseAudio();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setAudioBlob(file);
        setTranscriptionText("");
        toast.success("Audio file uploaded successfully!");
      } else {
        toast.error("Please upload an audio file");
      }
    }
  };

  const generateTranscription = async (): Promise<void> => {
    if (!audioBlob) {
      toast.error("Please record or upload audio first");
      return;
    }
    if (!ASR_ENDPOINT) {
      toast.error("ASR service endpoint is not configured. Please check environment variables.");
      return;
    }

    setIsProcessing(true);
    setIsUploading(true); // Indicate uploading state

    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob);

      const langParam = selectedLanguage?.language;
      const endpoint = `${ASR_ENDPOINT}?lang=${langParam}`;

      // Using AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal, // Assign abort signal for timeout
      });

      clearTimeout(timeoutId); // Clear timeout if fetch completes
      setIsUploading(false); // Finished "uploading" part

      if (!response.ok) {
        // Attempt to get error message from response body
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        console.error("Server error response:", errorData);
        const message = errorData?.message || errorData?.detail || (typeof errorData === 'string' ? errorData : `HTTP error! status: ${response.status}`);
        throw new Error(`Server error: ${response.status} - ${message}`);
      }

      // Determine if response is JSON or plain text
      const contentType = response.headers.get("content-type");
      let transcription = "";
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data && typeof data === 'object') {
            transcription = data.text || data.transcription || '';
        } else if (typeof data === 'string') { // Some APIs might return JSON string directly
            transcription = data;
        }
      } else {
        transcription = await response.text();
      }

      setTranscriptionText(transcription);
      toast.success("Transcription completed successfully!");

    } catch (error: any) {
      setIsUploading(false); // Ensure this is reset on error
      let errorMessage = "Failed to generate transcription: ";
      if (error.name === 'AbortError') {
        errorMessage += "Request timed out. The ASR service took too long to respond.";
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage += "Network error. Please check your internet connection and ensure the ASR service is accessible at the configured endpoint.";
      } else if (error.message.startsWith("Server error:")) {
        errorMessage += error.message;
      }
       else {
        errorMessage += `${error.message || "Unknown error"}`;
      }
      toast.error(errorMessage, { autoClose: 7000 });
    } finally {
      setIsProcessing(false); // General processing state
    }
  };

  const downloadTranscription = (): void => {
    if (!transcriptionText) return;

    const element = document.createElement("a");
    const file = new Blob([transcriptionText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${selectedLang}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setAudioBlob(file);
        setTranscriptionText("");
        toast.success("Audio file dropped and ready!");
      } else {
        toast.error("Please drop an audio file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const currentAudioUrl = audioUrl;
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* <Sidebar /> Removed Sidebar component */}

      {/* This div will now take up the full width as it's the only direct child of the flex container (or the only one with flex-1) */}
      <div className="flex-1 flex flex-col h-screen w-full overflow-y-auto bg-[url('/pricing.png')] bg-contain bg-no-repeat p-4 md:p-0">
        <header className="w-full flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl text-gray-800 font-custom ml-5">
              Speech to Text
            </h1>
            <ChevronRight size={16} />
          </div>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#000000] text-white hover:bg-[#2b2a2a] transition-colors"
          >
            <BarChart2 size={18} />
            {showDashboard ? "Close Analytics" : "Show Analytics"}
          </button>
        </header>

        {showDashboard ? (
          <SpeechDashboard />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row w-full mt-4 md:mt-0">
            <div
              className={`flex-1 md:flex-[2] flex flex-col items-start bg-white justify-start z-10 w-full ${
                isDragging ? "border-2 border-dashed border-blue-400 bg-blue-50" : ""
              } p-4 md:p-0`}
              onDragEnter={handleDragStart}
              onDragLeave={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="w-full flex flex-col items-center justify-center px-4 md:px-20 py-4 md:py-6">

                <div className="relative mt-4 md:mt-6 mb-6 md:mb-16">
                  <button
                    className={`text-white rounded-full p-5 md:p-7 shadow-lg transition-all flex items-center justify-center relative z-10 min-w-[60px] min-h-[60px] ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700 animate-pulse"
                        : "bg-black hover:bg-gray-800"
                    }`}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <Square className="h-8 w-8 md:h-12 md:w-12" />
                    ) : (
                      <Mic className="h-8 w-8 md:h-12 md:w-12" />
                    )}
                  </button>
                  {isRecording && (
                    <p className="text-center text-red-600 font-medium mt-2 md:mt-4 text-sm md:text-base">
                      Recording...
                    </p>
                  )}
                </div>

                {isProcessing && (
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-black"></div>
                      <span className="ml-2 md:ml-3 text-gray-700 text-sm md:text-base mt-2">
                        {isUploading ? `Uploading audio...` : "Processing audio..."}
                      </span>
                      {/* Progress bar removed as basic fetch doesn't support progress easily */}
                    </div>
                  </div>
                )}

                {audioUrl && !isRecording && (
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <div className="flex items-center p-2 bg-gray-100 rounded-full">
                      <button
                        className="bg-black text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] mr-2"
                        onClick={() => {
                          if (audioUrl) {
                            playAudio(audioUrl, { title: 'Local Recording', speaker: selectedLanguage?.name || 'User', createdAt: new Date().toLocaleDateString() });
                          }
                        }}
                        aria-label="Send to Player"
                      >
                        <Play className="h-6 w-6 md:h-8 md:w-8" />
                      </button>
                      <button
                        className="bg-red-600 text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
                        onClick={deleteRecording}
                        aria-label="Delete recording"
                      >
                        <Trash2 className="h-6 w-6 md:h-8 md:w-8" />
                      </button>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <p className="text-gray-700 font-medium text-sm md:text-base">
                        {globalIsPlaying && globalAudioUrl === audioUrl ? 'Now Playing' : 'Ready to Play'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 w-full sm:w-auto">
                    <button
                      className={`bg-black text-white rounded-lg px-4 py-2 md:px-6 md:py-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm md:text-base w-full sm:w-auto ${
                        !audioBlob || isProcessing
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-800"
                      }`}
                      onClick={generateTranscription}
                      disabled={!audioBlob || isProcessing}
                    >
                      {isProcessing ? (isUploading ? "Uploading..." : "Processing...") : "Generate"}
                    </button>
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        className="bg-black text-white rounded-lg px-4 py-2 md:px-6 md:py-3 shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm md:text-base w-full sm:w-auto"
                        aria-label="Upload audio file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-auto" ref={languageDropdownRef}>
                    <button
                      className="flex items-center justify-between bg-white/5 text-gray-800 rounded-lg px-3 py-2 md:px-4 md:py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors w-full"
                      onClick={() => setDropdownOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={dropdownOpen}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        {selectedLanguage && (
                          <Image
                            src={selectedLanguage.flag}
                            alt={selectedLanguage.name}
                            width={24} // Base width
                            height={24} // Base height
                            className="w-5 h-5 md:w-6 md:h-6 rounded-full" // Tailwind classes for display size
                          />
                        )}
                        <span className="font-medium text-sm md:text-base">
                          {selectedLanguage?.name}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 hover:bg-gray-100 transition-colors text-sm md:text-base ${
                              selectedLang === lang.code ? "bg-gray-50" : ""
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
                              className="w-5 h-5 md:w-6 md:h-6 rounded-full"
                            />
                            <span className="font-medium text-black">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isDragging && (
                  <div className="absolute inset-0 bg-blue-100/80 flex items-center justify-center rounded-lg z-50">
                    <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-lg">
                      <FileAudio className="h-12 w-12 md:h-16 md:w-16 text-blue-600 mx-auto mb-2 md:mb-4" />
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">
                        Drop your audio file here
                      </h3>
                      <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                        Support formats: MP3, WAV, M4A, etc.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative w-full h-[300px] md:h-[400px] mb-4 px-4 md:px-20">
                <div className="relative w-full h-full">
                  <textarea
                    ref={transcriptionRef}
                    className={`w-full h-full bg-gray-50 text-black resize-none outline-none px-4 py-3 md:px-6 md:py-4 rounded-lg relative z-10 border border-gray-200 text-sm md:text-base ${
                      transcriptionText
                        ? "focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
                        : ""
                    }`}
                    placeholder={
                      isDragging
                        ? "Drop audio file here to transcribe..."
                        : "Transcribed text will appear here..."
                    }
                    value={transcriptionText}
                    onChange={(e) => setTranscriptionText(e.target.value)}
                  />
                  <button
                    className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-black text-white rounded-full p-2 md:p-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 flex items-center justify-center z-20 min-w-[44px] min-h-[44px] ${
                      !transcriptionText ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                    }`}
                    onClick={downloadTranscription}
                    disabled={!transcriptionText}
                    aria-label="Download transcription"
                  >
                    <Download className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 md:flex-[1] flex flex-col items-start justify-start bg-white gap-4 md:gap-6 p-2 md:p-6 w-full md:border-l border-gray-300 mt-4 md:mt-0">
              <div className="w-full flex flex-row items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-1">
                  <button
                    className={`px-4 py-2 md:px-6 md:py-3 text-base md:text-lg font-medium relative transition-all duration-200 ${
                      activeTab === "history"
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    History
                  </button>
                  <button
                    className={`px-4 py-2 md:px-6 md:py-3 text-base md:text-lg font-medium relative transition-all duration-200 ${
                      activeTab === "settings"
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    Settings
                  </button>
                </div>
              </div>

              <div className="w-full mt-2 md:mt-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
                {activeTab === "history" && (
                  <div className="w-full space-y-3 md:space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <FileAudio className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm md:text-base font-medium">
                          No transcription history yet.
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm mt-2">
                          Your transcriptions will appear here
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
                                src={item.flag}
                                alt={item.language === "en" ? "English" : "Nepali"}
                                width={24}
                                height={24}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full ring-2 ring-gray-100"
                              />
                              <span className="font-medium text-black text-sm md:text-base">
                                {item.language === "en" ? "English" : "Nepali"}
                              </span>
                            </div>
                            <span className="text-xs md:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-3 text-sm md:text-base">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              className="bg-black text-white rounded-full p-2.5 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[44px] min-h-[44px] hover:shadow-md"
                              onClick={() => {
                                setTranscriptionText(item.text);
                                setSelectedLang(item.language);
                                toast.info("Loaded transcription from history.");
                              }}
                              aria-label="Load this transcription"
                            >
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button
                              className="bg-black text-white rounded-full p-2.5 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[44px] min-h-[44px] hover:shadow-md"
                              onClick={() => {
                                const element = document.createElement("a");
                                const file = new Blob([item.text], { type: "text/plain" });
                                element.href = URL.createObjectURL(file);
                                element.download = `transcription_${item.language}_${new Date()
                                  .toISOString()
                                  .slice(0, 10)}.txt`;
                                document.body.appendChild(element);
                                element.click();
                                document.body.removeChild(element);
                                URL.revokeObjectURL(element.href);
                                toast.success("History item downloaded.");
                              }}
                              aria-label="Download this transcription"
                            >
                              <Download className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="w-full space-y-4">
                    {/* Settings content remains the same, no img tags or axios calls here */}
                     <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        General Settings
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">Auto-save transcriptions</span>
                            <span className="text-gray-500 text-sm">Automatically save your transcriptions</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings.autoSave}
                              onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">Dark Mode</span>
                            <span className="text-gray-500 text-sm">Switch to dark theme (UI toggle only)</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings.darkMode}
                              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">Notifications</span>
                            <span className="text-gray-500 text-sm">Get notified about transcription status</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings.notifications}
                              onChange={(e) => {
                                setSettings({ ...settings, notifications: e.target.checked });
                                if (e.target.checked) toast.info("Notifications enabled!"); else toast.warn("Notifications disabled.");
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Language Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">Default Language</span>
                            <span className="text-gray-500 text-sm">Select your preferred language</span>
                          </div>
                          <select
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 min-w-[120px]"
                            value={settings.language}
                            onChange={(e) => {
                                setSettings({ ...settings, language: e.target.value });
                                setSelectedLang(e.target.value);
                                toast.info(`Default language set to ${LANGUAGES.find(l => l.code === e.target.value)?.name}`);
                            }}
                          >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Globalplayer
        isPlaying={globalIsPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={() => {
          if (globalAudioUrl) {
            if (globalIsPlaying) {
              pauseAudio();
            } else {
              playAudio(globalAudioUrl, globalTrackInfo || { title: 'Unknown Track', speaker: 'Unknown' });
            }
          }
        }}
        onVolumeChange={() => {}}
        onForward={() => {}}
        onBackward={() => {}}
        trackInfo={globalTrackInfo || { title: 'No track loaded', speaker: '' }}
        onSeek={(percentage: number) => {
            if (duration > 0) {
                seekAudio((percentage / 100) * duration);
            }
        }}
      />
    </div>
  );
};

export default AudioTranscriberPage;