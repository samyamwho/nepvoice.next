'use client';

import React from 'react';
import { X, User, Clock, Globe, Volume2, Sliders, Zap, Bot, Play, Pause } from 'lucide-react';
import type { TTSLogEntry } from './TTSDashboard';
import { useAudio } from '@/components/context/AudioContext';

interface TTSDetailsPopupProps {
  call: TTSLogEntry;
  onClose: () => void;
}

const TTSDetailsPopup: React.FC<TTSDetailsPopupProps> = ({ call, onClose }) => {
  const { playAudio, pauseAudio, isPlaying, audioUrl } = useAudio();

  const handlePlayAudio = () => {
    if (call.details?.audioUrl) {
      if (isPlaying && audioUrl === call.details.audioUrl) {
        pauseAudio();
      } else {
        playAudio(call.details.audioUrl, {
          id: call.service_id.toString(),
          title: call.name,
          audioUrl: call.details.audioUrl,
          createdAt: call.timestamp,
          speaker: call.voice
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Popup content */}
      <div className="relative z-10 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl mx-auto overflow-hidden flex flex-col transition-all duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white via-gray-50 to-white">
          <div className="flex items-center gap-">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">TTS Log Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
            <X size={23} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-10 space-y-8 overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-white" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - TTS Info */}
            <div className="bg-white/80 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Name */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.name || 'N/A'}</div>
                {/* Timestamp */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timestamp</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.timestamp || 'N/A'}</div>
                {/* Language */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Language</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.language || 'N/A'}</div>
                {/* Voice */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Voice</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.voice || 'N/A'}</div>
                {/* Style */}
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Style</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.style !== undefined ? call.style : 'N/A'}</div>
                {/* Speed */}
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Speed</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.speed !== undefined ? `${call.speed}x` : 'N/A'}</div>
                {/* Agent */}
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Agent</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{call.details?.agent || 'N/A'}</div>
              </div>
            </div>

            {/* Right Column - Input Text and Audio */}
            <div className="bg-white/80 rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
              {(call.details?.audioUrl || call.details?.transcript) ? (
                <>
                  {call.details?.transcript && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Input Text</h3>
                      <div className="bg-white p-5 rounded-lg max-h-60 overflow-y-auto border border-gray-200 shadow-inner mb-6">
                        <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{call.details.transcript}</p>
                      </div>
                    </div>
                  )}
                  {call.details?.audioUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated Audio</h3>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayAudio}
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                          {isPlaying && audioUrl === call.details.audioUrl ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        <audio
                          controls
                          src={call.details.audioUrl}
                          className="flex-1 h-12 rounded-lg bg-gray-100"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center h-full flex items-center justify-center">
                  <p className="text-base text-gray-500">No audio recording or transcript available for this log.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSDetailsPopup;