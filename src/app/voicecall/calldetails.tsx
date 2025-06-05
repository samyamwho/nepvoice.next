"use client";

import React, { useState } from 'react';
import { X, Play, Pause, Volume2 } from 'lucide-react';

interface ConversationMessage {
  agent?: {
    speaks: string;
    timestamp: string;
  };
  customer?: {
    speaks: string;
    timestamp: string;
    audio_path?: string;
  };
}

interface CallData {
  name: string;
  phone_number: string;
  assigned_container: string;
  scheduled_for_utc: string;
  status: string;
  call_type: string;
  conversation: {
    [key: string]: ConversationMessage;
  };
}

interface CallDetailsProps {
  onClose: () => void;
  // If callData were to be passed as a prop, it would be defined here:
  // callData: CallData; 
}

const CallDetails: React.FC<CallDetailsProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data - replace with actual data later (e.g., passed as a prop or fetched)
  const callData: CallData = {
    name: "Pawan Ji",
    phone_number: "9860885443",
    assigned_container: "global-audiosocket-102",
    scheduled_for_utc: "2025-04-09T17:01:54.843452",
    status: "answered",
    call_type: "atm_capture",
    conversation: {
      "1": {
        agent: {
          speaks: "नमस्ते! म ग्लोबल बैंकबाट प्रतिवा बोल्दैछु! के तपाईं पवन जी बोल्दै हुनुहुन्छ!",
          timestamp: "2025-04-09T17:02:38.226110"
        },
        customer: {
          speaks: "  उ य हो हेलो",
          timestamp: "2025-04-09T17:03:00.947400",
          audio_path: "/home/bumblebee/wiseyak/abhi/global/global-audio-socket/vad_output/2025-04-09 22:48:00___demo-scheduled-from-ui-globalc31c761d-fd78-4711-bc8b-de4d034ec711__0.wav"
        }
      },
      "2": {
        agent: {
          speaks: "तपाईंको एटीएम कार्ड क्याप्चर भएको विषयमा कुरा गर्नु थियो। अहिले हजुरसँग कुरा गर्न मिल्छ?",
          timestamp: "2025-04-09T17:03:01.224740"
        },
        customer: {
          speaks: " मिल्छ मिल्छ",
          timestamp: "2025-04-09T17:03:14.635502",
          audio_path: "/home/bumblebee/wiseyak/abhi/global/global-audio-socket/vad_output/2025-04-09 22:48:14___demo-scheduled-from-ui-globalc31c761d-fd78-4711-bc8b-de4d034ec711__1.wav"
        }
      },
      "3": {
        agent: {
          speaks: "हामीले तपाईंको कार्डलाई अस्थायी रूपमा ब्लक गरेका छौं। तपाईंको कार्ड एक हप्ता पछि मात्र बैंकमा आउनेछ र कार्ड फिर्ता लिनको लागि तपाईं आफ्नो नागरिकता वा ड्राइभिङ लाइसेन्स वा पासपोर्ट लिएर ग्लोबल बैंकको कमलादी शाखामा जानुहोला।",
          timestamp: "2025-04-09T17:03:14.888181"
        },
        customer: {
          speaks: " हवस् हवस्",
          timestamp: "2025-04-09T17:03:43.405559",
          audio_path: "/home/bumblebee/wiseyak/abhi/global/global-audio-socket/vad_output/2025-04-09 22:48:43___demo-scheduled-from-ui-globalc31c761d-fd78-4711-bc8b-de4d034ec711__2.wav"
        }
      },
      "4": {
        agent: {
          speaks: "मैले तपाईंको प्रतिक्रिया रेकर्ड गरेकी छु, तपाईंको समयको लागि धन्यवाद।",
          timestamp: "2025-04-09T17:03:43.652166"
        }
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Popup content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[90%] md:w-[70%] h-[90%] md:h-[85%] mx-4 overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel - Call Details (60%) */}
        <div className="w-full md:w-[60%] border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Call Details</h2>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-grow">
            {/* Call Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-4">CALL INFORMATION</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800 text-sm md:text-base">{callData.name}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-800 text-sm md:text-base">{callData.phone_number}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Container</p>
                  <p className="font-medium text-gray-800 text-sm md:text-base">{callData.assigned_container}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${callData.status === 'answered' ? 'bg-green-100 text-green-800' : 
                      callData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      callData.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {callData.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Call Type</p>
                  <p className="font-medium text-gray-800 text-sm md:text-base">{callData.call_type}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Scheduled For</p>
                  <p className="font-medium text-gray-800 text-sm md:text-base">
                    {new Date(callData.scheduled_for_utc).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Call Recording */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Volume2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">Call Recording</h3>
                      <p className="text-xs md:text-sm text-gray-500">Full conversation audio</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                      title="Download Recording"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                      title="Share Recording"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">00:00</span>
                      <div className="w-32 sm:w-48 md:w-[200px] lg:w-[300px] h-1.5 bg-gray-200 rounded-full">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">3:45</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900" title="Volume">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900" title="Edit Transcript (mock)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>Recorded on {new Date(callData.scheduled_for_utc).toLocaleDateString()}</span>
                  <span>File size: 2.4 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Conversation (40%) */}
        <div className="w-full md:w-[40%] flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b md:border-b-0 md:border-l border-gray-200 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Conversation</h2>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Conversation Content */}
          <div className="flex-1 p-4 md:p-6 md:border-l border-gray-200 overflow-hidden">
            <div className="bg-gray-50 shadow-inner rounded-lg p-4 space-y-6 h-full overflow-y-auto">
              {Object.entries(callData.conversation).map(([key, message]) => (
                <div key={key} className="space-y-4">
                  {message.agent && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[80%]">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          <span className="text-xs font-medium text-blue-600">Agent</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">{formatTimestamp(message.agent.timestamp)}</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg rounded-tr-none shadow-sm border border-blue-100">
                          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{message.agent.speaks}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {message.customer && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-green-600">Customer</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">{formatTimestamp(message.customer.timestamp)}</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg rounded-tl-none shadow-sm border border-green-100">
                          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{message.customer.speaks}</p>
                          {/* {message.customer.audio_path && (
                            <p className="text-xs text-gray-400 mt-1 truncate" title={message.customer.audio_path}>
                              Audio: {message.customer.audio_path.split('/').pop()}
                            </p>
                          )} */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetails;