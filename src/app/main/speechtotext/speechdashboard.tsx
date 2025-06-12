'use client';

import React, { useState } from 'react';
import { Mic, Clock, Activity, BarChart2, Settings, FileText, CreditCard, DollarSign, AlertCircle, Percent, Languages } from 'lucide-react'; // Changed Phone to Mic, Volume2 to Percent/Languages
import STTDetailsPopup from './STTDetailsPopup'; // Renamed import
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAudio } from '@/components/context/AudioContext'; // Assuming this context is generic enough

export interface STTLogEntryDetails {
  agent: string;
  transcript: string;
  audioUrl: string; // Input audio for STT
  wordErrorRate?: number; // Optional: Word Error Rate
  detectedLanguage?: string; // Optional: If language detection is used
}

export interface STTLogEntry {
  service_id: number;
  fileName: string; // Or some identifier for the audio
  timestamp: string;
  languageHint?: string; // Language user specified, if any
  modelUsed?: string; // STT model used
  audioDuration: number; // in seconds
  details: STTLogEntryDetails;
}

const mockSTTLogs: STTLogEntry[] = [
  {
    service_id: 1,
    fileName: "meeting_recording_001.wav",
    timestamp: "2024-03-20 14:30",
    languageHint: "English",
    modelUsed: "Whisper V3",
    audioDuration: 125, // seconds
    details: {
      agent: "STT AI Service",
      transcript: "Hello, this is a transcription from the first audio file. We discussed the quarterly earnings and future projections. The meeting was quite productive overall, and we should follow up on the action items listed in the summary. This transcript can be a bit longer to test the scrolling functionality.",
      audioUrl: "https://example.com/audio_input1.mp3",
      wordErrorRate: 0.05, // 5% WER
      detectedLanguage: "English (US)"
    }
  },
  {
    service_id: 2,
    fileName: "customer_call_support.mp3",
    timestamp: "2024-03-21 10:15",
    languageHint: "Nepali",
    modelUsed: "Google Speech-to-Text",
    audioDuration: 72,
    details: {
      agent: "STT AI Service",
      transcript: "नमस्ते, म तपाईंलाई कसरी मद्दत गर्न सक्छु? हजुरको समस्या के हो?",
      audioUrl: "https://example.com/audio_input2.mp3",
      wordErrorRate: 0.08,
      detectedLanguage: "Nepali"
    }
  },
  {
    service_id: 3,
    fileName: "lecture_snippet_ai.ogg",
    timestamp: "2024-03-22 16:45",
    modelUsed: "Azure Speech Services",
    audioDuration: 300,
    details: {
      agent: "STT AI Service",
      transcript: "Artificial intelligence is rapidly changing the world. In this lecture, we will explore the fundamentals of machine learning and deep learning. This is another example to check the popup's content handling.",
      audioUrl: "https://example.com/audio_input3.mp3",
      wordErrorRate: 0.03,
      detectedLanguage: "English (UK)"
    }
  },
  {
    service_id: 4,
    fileName: "short_command.flac",
    timestamp: "2024-03-23 09:05",
    languageHint: "English",
    modelUsed: "Whisper V3",
    audioDuration: 5,
    details: {
      agent: "STT AI Service",
      transcript: "Turn on the lights.",
      audioUrl: "https://example.com/audio_input4.mp3",
      // wordErrorRate: undefined, // Example of missing WER
      detectedLanguage: "English (US)"
    }
  }
];

// Credit usage interface can remain largely the same, context changes
interface CreditUsage {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  lastBillingDate: string;
  nextBillingDate: string;
  usageHistory: { // Credits now for transcription time or API calls
    date: string;
    credits: number; // e.g., per minute of audio or per call
    cost: number;
  }[];
}

const mockCreditUsage: CreditUsage = {
  totalCredits: 5000, // e.g., minutes or calls
  usedCredits: 1250,
  remainingCredits: 3750,
  lastBillingDate: "2024-03-01",
  nextBillingDate: "2024-04-01",
  usageHistory: [
    { date: "2024-03-20", credits: 150, cost: 15.00 }, // e.g. 150 minutes
    { date: "2024-03-19", credits: 200, cost: 20.00 },
    { date: "2024-03-18", credits: 180, cost: 18.00 },
    { date: "2024-03-17", credits: 100, cost: 10.00 },
  ]
};

// Usage data for charts
const mockUsageData = [ // Represents transcription count or minutes transcribed
  { date: '2024-03-17', transcriptionCount: 10, credits: 100 },
  { date: '2024-03-18', transcriptionCount: 18, credits: 180 },
  { date: '2024-03-19', transcriptionCount: 20, credits: 200 },
  { date: '2024-03-20', transcriptionCount: 15, credits: 150 },
  { date: '2024-03-21', transcriptionCount: 12, credits: 120 },
  { date: '2024-03-22', transcriptionCount: 25, credits: 250 },
  { date: '2024-03-23', transcriptionCount: 9, credits: 90 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; bgColorClass?: string; textColorClass?: string }> = ({ title, value, icon: Icon, bgColorClass = 'bg-blue-500', textColorClass = 'text-white' }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
    <div className={`p-3 ${bgColorClass} ${textColorClass} rounded-full`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function STTDashboard() {
  const [selectedLog, setSelectedLog] = useState<STTLogEntry | null>(null); // Renamed state
  const [activeTab, setActiveTab] = useState('analytics');
  const { playAudio } = useAudio(); // Assuming pauseAudio is handled by the player itself

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (audioUrl) {
      playAudio(audioUrl, {
        id: Date.now().toString(), // Simple ID
        title,
        audioUrl,
        createdAt: new Date().toLocaleDateString()
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}m ${sec}s`;
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'logs', label: 'Transcription Logs', icon: FileText },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        const totalAudioDuration = mockSTTLogs.reduce((acc, log) => acc + log.audioDuration, 0);
        const avgAudioDuration = mockSTTLogs.length > 0 ? totalAudioDuration / mockSTTLogs.length : 0;
        const uniqueLanguages = new Set(mockSTTLogs.map(log => log.details.detectedLanguage || log.languageHint).filter(Boolean)).size;
        const avgWER = mockSTTLogs.length > 0 ? 
                        (mockSTTLogs.reduce((acc, log) => acc + (log.details.wordErrorRate || 0), 0) / mockSTTLogs.filter(log => log.details.wordErrorRate !== undefined).length || 0) * 100
                        : 0;
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Transcriptions" value={mockSTTLogs.length.toString()} icon={Mic} bgColorClass="bg-blue-100" textColorClass="text-blue-600" />
              <StatCard title="Languages Detected" value={uniqueLanguages.toString()} icon={Languages} bgColorClass="bg-yellow-100" textColorClass="text-yellow-600" />
              <StatCard title="Avg. Audio Duration" value={formatDuration(avgAudioDuration)} icon={Clock} bgColorClass="bg-green-100" textColorClass="text-green-600" />
              <StatCard title="Avg. Word Error Rate" value={`${avgWER.toFixed(2)}%`} icon={Percent} bgColorClass="bg-purple-100" textColorClass="text-purple-600" />
            </div>

            {/* Usage Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcription Volume Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockUsageData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTranscription" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088cc" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0088cc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('-')[2]} // Show only day
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Transcriptions', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                      formatter={(value, name) => {
                        if (name === "transcriptionCount") return [`${value} transcriptions`, 'Count'];
                        return [value, name];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="transcriptionCount" 
                      stroke="#0088cc" 
                      fillOpacity={1} 
                      fill="url(#colorTranscription)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );

      case 'logs':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transcription Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WER</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockSTTLogs.map((log) => (
                    <tr key={log.service_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.fileName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details.detectedLanguage || log.languageHint || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(log.audioDuration)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.modelUsed || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.details.wordErrorRate !== undefined ? `${(log.details.wordErrorRate * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {log.details.audioUrl && (
                            <button
                              onClick={() => handlePlayAudio(log.details.audioUrl, log.fileName)}
                              className="text-[#0088cc] hover:text-[#0077b3] transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                            >
                              Play Audio
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-[#0088cc] hover:text-[#0077b3] transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="space-y-6">
            {/* Credit Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Credits (e.g., minutes)" 
                value={mockCreditUsage.totalCredits.toString()} 
                icon={CreditCard} 
                bgColorClass="bg-blue-100" 
                textColorClass="text-blue-600" 
              />
              <StatCard 
                title="Used Credits" 
                value={mockCreditUsage.usedCredits.toString()} 
                icon={Activity} 
                bgColorClass="bg-yellow-100" 
                textColorClass="text-yellow-600" 
              />
              <StatCard 
                title="Remaining Credits" 
                value={mockCreditUsage.remainingCredits.toString()} 
                icon={AlertCircle} 
                bgColorClass="bg-green-100" 
                textColorClass="text-green-600" 
              />
            </div>

            {/* Credit Usage Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Usage History (by minutes/calls)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockUsageData} // Using mockUsageData which has 'credits'
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('-')[2]} // Show only day
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Credits Used', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                      formatter={(value) => [`${value} credits`, 'Usage']}
                    />
                    <Bar 
                      dataKey="credits" 
                      fill="#0088cc" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Usage Table (same as TTS, context is STT) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Recent Credit Usage</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCreditUsage.usageHistory.map((usage, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usage.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usage.credits}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${usage.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'billing': // Billing tab can remain structurally similar
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Billing Information</h2>
              {/* Content similar to TTS, adjust labels if needed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Last Billing Date</p>
                    <p className="text-lg font-medium text-gray-800">{mockCreditUsage.lastBillingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="text-lg font-medium text-gray-800">{mockCreditUsage.nextBillingDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-lg font-medium text-gray-800">$0.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-lg font-medium text-gray-800">Credit Card ending in 4242</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing History</h3>
              {/* Content similar to TTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">March 2024</p>
                    <p className="text-sm text-gray-500">{mockCreditUsage.usageHistory.find(h => h.date.startsWith("2024-03"))?.credits || 500} credits used</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${(mockCreditUsage.usageHistory.find(h => h.date.startsWith("2024-03"))?.cost || 50).toFixed(2)}</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">February 2024</p>
                    <p className="text-sm text-gray-500">480 credits used</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">$48.00</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings': // Settings tab would have STT-specific options
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Transcription Settings</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Default Language Hint</p>
                      <p className="text-sm text-gray-500">Suggest a language for transcription (model may override)</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                      <option className="text-gray-500">Auto-Detect</option>
                      <option className="text-gray-500">English</option>
                      <option className="text-gray-500">Nepali</option>
                      <option className="text-gray-500">Spanish</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Default Transcription Model</p>
                      <p className="text-sm text-gray-500">Choose the preferred STT model</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                      <option className="text-gray-500">Whisper V3 (High Accuracy)</option>
                      <option className="text-gray-500">Google Speech-to-Text (Balanced)</option>
                       <option className="text-gray-500">Azure Speech (Fast)</option>
                    </select>
                  </div>
                   <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Enable Speaker Diarization</p>
                      <p className="text-sm text-gray-500">Identify different speakers in the audio</p>
                    </div>
                    <label htmlFor="diarizationToggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                        <input type="checkbox" id="diarizationToggle" className="sr-only" />
                        <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                    </label>
                  </div>     
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 font-custom">
          <main className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </main>
        </div>
      </div>

      {selectedLog && ( // Renamed selectedCall to selectedLog
        <STTDetailsPopup // Renamed component
          logEntry={selectedLog} // Renamed prop
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}