"use client";

import React, { useState } from 'react';
// Lucide icons (X, Play, Pause, Volume2) are removed as per request.
// If you need textual representations, you'll add them directly in the JSX.

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
  // callData: CallData; 
}

const CallDetails: React.FC<CallDetailsProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

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
      <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-[90%] md:w-[70%] h-[90%] md:h-[85%] mx-4 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-[60%] border-r border-gray-200 flex flex-col">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Call Details</h2>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-grow">
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

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {/* Volume2 icon removed */}
                      <span className="text-blue-600 text-sm">Rec</span>
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
                      {/* Download SVG removed */}
                      <span className="text-xs">Download</span>
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                      title="Share Recording"
                    >
                      {/* Share SVG removed */}
                       <span className="text-xs">Share</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white text-xs"
                    >
                      {/* Play/Pause icons removed */}
                      {isPlaying ? "Pause" : "Play"}
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
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 text-xs" title="Volume">
                      {/* Volume SVG removed */}
                      Volume
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 text-xs" title="Edit Transcript (mock)">
                      {/* Edit SVG removed */}
                      Edit
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

        <div className="w-full md:w-[40%] flex flex-col">
          <div className="p-4 md:p-6 border-b md:border-b-0 md:border-l border-gray-200 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Conversation</h2>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700 text-sm"
              title="Close"
            >
              {/* X icon removed */}
              Close
            </button>
          </div>

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