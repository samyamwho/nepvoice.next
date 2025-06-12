'use client';

import React from 'react';
import {
  X,
  FileText,
  Clock,  
  Languages,
  Timer, 
  Cpu,    
  Percent, 
  Bot,      
  Play,
  Pause,
} from 'lucide-react';
import type { STTLogEntry } from './speechdashboard';
import { useAudio } from '@/components/context/AudioContext';

interface STTDetailsPopupProps {
  logEntry: STTLogEntry;
  onClose: () => void;
  // onPlayAudio is not needed if useAudio is handled internally
}

const STTDetailsPopup: React.FC<STTDetailsPopupProps> = ({ logEntry, onClose }) => {
  const { playAudio, pauseAudio, isPlaying, audioUrl: currentPlayingAudioUrl } = useAudio();

  const handlePlayOriginalAudio = () => {
    if (logEntry.details?.audioUrl) {
      if (isPlaying && currentPlayingAudioUrl === logEntry.details.audioUrl) {
        pauseAudio();
      } else {
        playAudio(logEntry.details.audioUrl, {
          id: logEntry.service_id.toString(),
          title: logEntry.fileName,
          audioUrl: logEntry.details.audioUrl,
          createdAt: logEntry.timestamp,

        });
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  };

  if (!logEntry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative z-10 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl mx-auto overflow-hidden flex flex-col transition-all duration-300 bg-white"> {/* Added bg-white to main popup container */}
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white via-gray-50 to-white">
          <div className="flex items-center gap-3"> {/* Added gap for icon and title */}
             <FileText className="w-7 h-7 text-blue-500" /> {/* Icon for STT */}
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Transcription Log Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
            <X size={23} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-10 space-y-8 overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-white" style={{ maxHeight: 'calc(100vh - 10rem)' }}> {/* Adjusted maxHeight slightly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - STT Info */}
            <div className="bg-white/80 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* File Name */}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">File Name</span>
                </div>
                <div className="text-lg text-gray-800 font-medium truncate" title={logEntry.fileName}>{logEntry.fileName || 'N/A'}</div>

                {/* Timestamp */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timestamp</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{new Date(logEntry.timestamp).toLocaleString() || 'N/A'}</div>

                {/* Detected Language */}
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Language</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{logEntry.details.detectedLanguage || logEntry.languageHint || 'N/A'}</div>

                {/* Audio Duration */}
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Duration</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{formatDuration(logEntry.audioDuration)}</div>
                
                {/* Model Used */}
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Model Used</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{logEntry.modelUsed || 'N/A'}</div>

                {/* Word Error Rate (WER) */}
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Word Error Rate</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">
                  {logEntry.details.wordErrorRate !== undefined ? `${(logEntry.details.wordErrorRate * 100).toFixed(1)}%` : 'N/A'}
                </div>
                
                {/* Agent */}
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Agent</span>
                </div>
                <div className="text-lg text-gray-800 font-medium">{logEntry.details?.agent || 'N/A'}</div>
              </div>
            </div>

            {/* Right Column - Transcript and Original Audio */}
            <div className="bg-white/80 rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
              {(logEntry.details?.audioUrl || logEntry.details?.transcript) ? (
                <>
                  {logEntry.details?.transcript && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Transcript</h3>
                      <div className="bg-white p-5 rounded-lg max-h-60 overflow-y-auto border border-gray-200 shadow-inner mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{logEntry.details.transcript}</p>
                      </div>
                    </div>
                  )}
                  {logEntry.details?.audioUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Original Audio</h3>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayOriginalAudio}
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                          aria-label={isPlaying && currentPlayingAudioUrl === logEntry.details.audioUrl ? "Pause audio" : "Play audio"}
                        >
                          {isPlaying && currentPlayingAudioUrl === logEntry.details.audioUrl ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        <audio
                          controls
                          src={logEntry.details.audioUrl}
                          className="flex-1 h-12 rounded-lg bg-gray-100"
                          preload="metadata"
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

export default STTDetailsPopup;