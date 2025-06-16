'use client';

import React, { useState } from 'react';
import { Phone, Clock, Activity, Volume2, BarChart2, Settings, FileText, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import TTSDetailsPopup from './TTSDetailsPopup'; // Import the separated popup
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAudio } from '@/components/context/AudioContext';

export interface TTSLogEntryDetails {
  agent: string;
  transcript: string;
  audioUrl?: string;
}

export interface TTSLogEntry {
  service_id: number;
  name: string;
  timestamp: string;
  language: string;
  voice: string;
  style: number;
  speed: number;
  details?: TTSLogEntryDetails;
}

const mockTTSLogs: TTSLogEntry[] = [
  {
    service_id: 1,
    name: "John Doe",
    timestamp: "2024-03-20 14:30",
    language: "English",
    voice: "en-US-Standard-A",
    style: 1,
    speed: 1.0,
    details: {
      agent: "TTS AI Agent",
      transcript: "Hello, this is a test sample for our voice service. This transcript can be a bit longer to test the scrolling functionality within the details popup. We want to ensure that if the text exceeds the allocated space, a scrollbar appears and functions correctly, allowing the user to view the entire content without breaking the layout of the popup itself.",
      audioUrl: "https://example.com/recording1.mp3"
    }
  },
  {
    service_id: 2,
    name: "Jane Smith",
    timestamp: "2024-03-21 10:15",
    language: "Nepali",
    voice: "ne-NP-Standard-B",
    style: 1,
    speed: 0.9,
    details: {
      agent: "TTS AI Agent",
      transcript: "यो नेपाली भाषामा एक परीक्षण ट्रान्सक्रिप्ट हो।",
      audioUrl: "https://example.com/recording2.mp3"
    }
  },
  {
    service_id: 3,
    name: "Michael Lee",
    timestamp: "2024-03-22 16:45",
    language: "English",
    voice: "en-GB-Standard-C",
    style: 2,
    speed: 1.1,
    details: {
      agent: "TTS AI Agent",
      transcript: "I fell off the bridge yesterday. This is another example to check the popup's content handling.",
      audioUrl: "https://example.com/recording3.mp3"
    }
  },
  {
    service_id: 4,
    name: "Sara Khan",
    timestamp: "2024-03-23 09:05",
    language: "Nepali",
    voice: "ne-NP-Standard-A",
    style: 1,
    speed: 1.0,
    details: { // Note: audioUrl is missing here, matching the original structure
      agent: "TTS AI Agent",
      transcript: "यो के हो?",
    }
  }
];

// Add new interfaces for credit usage
interface CreditUsage {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  lastBillingDate: string;
  nextBillingDate: string;
  usageHistory: {
    date: string;
    credits: number;
    cost: number;
  }[];
}

// Mock credit usage data
const mockCreditUsage: CreditUsage = {
  totalCredits: 1000,
  usedCredits: 450,
  remainingCredits: 550,
  lastBillingDate: "2024-03-01",
  nextBillingDate: "2024-04-01",
  usageHistory: [
    { date: "2024-03-20", credits: 50, cost: 5.00 },
    { date: "2024-03-19", credits: 75, cost: 7.50 },
    { date: "2024-03-18", credits: 60, cost: 6.00 },
    { date: "2024-03-17", credits: 45, cost: 4.50 },
  ]
};

// Add mock data for usage over time
const mockUsageData = [
  { date: '2024-03-17', ttsCount: 45, credits: 45 },
  { date: '2024-03-18', ttsCount: 60, credits: 60 },
  { date: '2024-03-19', ttsCount: 75, credits: 75 },
  { date: '2024-03-20', ttsCount: 50, credits: 50 },
  { date: '2024-03-21', ttsCount: 65, credits: 65 },
  { date: '2024-03-22', ttsCount: 80, credits: 80 },
  { date: '2024-03-23', ttsCount: 55, credits: 55 },
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

export default function TTSDashboard() {
  const [selectedCall, setSelectedCall] = useState<TTSLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const { playAudio } = useAudio();

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (audioUrl) {
      playAudio(audioUrl, {
        id: Date.now().toString(),
        title,
        audioUrl,
        createdAt: new Date().toLocaleDateString()
      });
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'logs', label: 'TTS Logs', icon: FileText },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total TTS Generated" value={mockTTSLogs.length.toString()} icon={Phone} bgColorClass="bg-blue-100" textColorClass="text-blue-600" />
              <StatCard title="Languages Used" value={new Set(mockTTSLogs.map(log => log.language)).size.toString()} icon={Activity} bgColorClass="bg-yellow-100" textColorClass="text-yellow-600" />
              <StatCard title="Avg. Speed" value={(mockTTSLogs.reduce((acc, log) => acc + log.speed, 0) / mockTTSLogs.length || 0).toFixed(2) + "x"} icon={Clock} bgColorClass="bg-green-100" textColorClass="text-green-600" />
              <StatCard title="Different Voices" value={new Set(mockTTSLogs.map(log => log.voice)).size.toString()} icon={Volume2} bgColorClass="bg-purple-100" textColorClass="text-purple-600" />
            </div>

            {/* Usage Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockUsageData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTTS" x1="0" y1="0" x2="0" y2="1">
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
                      label={{ value: 'TTS Count', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value} TTS`, 'Count']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ttsCount" 
                      stroke="#0088cc" 
                      fillOpacity={1} 
                      fill="url(#colorTTS)" 
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
              <h2 className="text-xl font-semibold text-gray-800">Recent TTS Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockTTSLogs.map((log) => (
                    <tr key={log.service_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.voice}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.style}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.speed}x</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {log.details?.audioUrl && (
                            <button
                              onClick={() => handlePlayAudio(log.details!.audioUrl!, log.name)}
                              className="text-[#0088cc] hover:text-[#0077b3] transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                            >
                              Play
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCall(log)}
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
                title="Total Credits" 
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Usage History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockUsageData}
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
                      label={{ value: 'Credits', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
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

            {/* Recent Usage Table */}
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

      case 'billing':
        return (
          <div className="space-y-6">
            {/* Billing Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Billing Information</h2>
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

            {/* Billing History */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">March 2024</p>
                    <p className="text-sm text-gray-500">1000 credits</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">$100.00</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">February 2024</p>
                    <p className="text-sm text-gray-500">1000 credits</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">$100.00</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
            <div className="space-y-6">
              {/* Settings sections */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Default Language</p>
                      <p className="text-sm text-gray-500">Set the default language for new TTS requests</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                      <option className="text-gray-500">English</option>
                      <option className="text-gray-500">Nepali</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Default Voice</p>
                      <p className="text-sm text-gray-500">Set the default voice for new TTS requests</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                      <option className="text-gray-500">en-US-Standard-A</option>
                      <option className="text-gray-500">ne-NP-Standard-B</option>
                    </select>
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

      {selectedCall && (
        <TTSDetailsPopup
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}