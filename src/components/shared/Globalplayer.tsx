// src/components/Shared/Globalplayer.tsx
'use client';

import React from 'react';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Share2,
    Download,
    MoreVertical,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { AudioTrackInfo } from '@/components/context/AudioContext';

interface GlobalplayerProps {
    trackInfo?: AudioTrackInfo | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    onPlayPause: () => void;
    onSeek: (percentage: number) => void;
    onVolumeChange: (newVolume: number) => void;
    onForward: () => void;
    onBackward: () => void;
    isLoading?: boolean;
    error?: string | null;
}

const Globalplayer: React.FC<GlobalplayerProps> = ({
    trackInfo = null,
    isPlaying,
    currentTime,
    duration,
    volume,
    onPlayPause,
    onSeek,
    onVolumeChange,
    onForward,
    onBackward,
    isLoading = false,
    error = null,
}) => {
    const hasTrack = !!trackInfo && !!duration && duration > 0;
    const progressPercent = (hasTrack && duration > 0) ? (currentTime / duration) * 100 : 0;

    const formatTime = (time: number) => {
        if (!isFinite(time) || time < 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const currentTimeFormatted = formatTime(currentTime);
    const durationFormatted = formatTime(duration);

    if (error) {
        return (
            <motion.div
                initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="fixed bottom-0 left-0 right-0 z-[100] bg-red-100 text-red-700 px-4 py-3 md:px-6 border-t border-red-300 shadow-lg"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                    <p className="text-sm font-medium">Player Error: {error}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-[10] bg-white text-black px-4 py-3 md:px-6 border-t border-gray-200 shadow-lg"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                {/* Left: Track Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {trackInfo?.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={trackInfo.imageUrl}
                                alt={trackInfo?.title || 'Track art'}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{trackInfo?.title || (hasTrack ? 'Untitled Track' : 'No Track Playing')}</p>
                        <p className="text-xs text-gray-600 truncate">
                            {trackInfo?.speaker || (hasTrack ? 'Unknown Artist' : '')}
                            {trackInfo?.createdAt && hasTrack ? ` · ${trackInfo.createdAt}` : ''}
                        </p>
                    </div>
                </div>

                {/* Center: Controls & Progress */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-md md:max-w-xl">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={onBackward} 
                            className={`p-1 text-black hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`} 
                            disabled={!hasTrack || isLoading} 
                            aria-label="Rewind 10 seconds"
                        >
                            <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <button 
                            onClick={onPlayPause} 
                            className={`bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full p-2.5 md:p-3 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all`} 
                            disabled={!hasTrack || isLoading} 
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 md:h-6 md:w-6 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                            ) : isPlaying ? (
                                <Pause className="h-5 w-5 md:h-6 md:w-6" />
                            ) : (
                                <Play className="h-5 w-5 md:h-6 md:w-6" />
                            )}
                        </button>
                        <button 
                            onClick={onForward} 
                            className={`p-1 text-black hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`} 
                            disabled={!hasTrack || isLoading} 
                            aria-label="Forward 10 seconds"
                        >
                            <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-gray-500 w-10 text-right tabular-nums">{hasTrack ? currentTimeFormatted : '00:00'}</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={hasTrack ? progressPercent : 0}
                            onChange={(e) => { if (hasTrack) onSeek(parseFloat(e.target.value)); }}
                            disabled={!hasTrack || isLoading}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-800 disabled:opacity-50 disabled:cursor-not-allowed range-lg"
                            style={{ background: `linear-gradient(to right, #374151 ${progressPercent}%, #e5e7eb ${progressPercent}%)` }}
                            aria-label="Seek slider"
                        />
                        <span className="text-xs text-gray-500 w-10 tabular-nums">{hasTrack ? durationFormatted : '00:00'}</span>
                    </div>
                </div>

                {/* Right: Volume & Actions */}
                <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <button 
                            onClick={() => onVolumeChange(volume > 0.01 ? 0 : 1)} 
                            className="p-1 text-black hover:text-gray-700 disabled:opacity-50 transition-colors" 
                            disabled={!hasTrack} 
                            aria-label={volume > 0.01 ? "Mute" : "Unmute"}
                        >
                            {volume > 0.01 ? (
                                <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                        </button>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-16 md:w-20 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-800 disabled:opacity-50 range-sm"
                            disabled={!hasTrack}
                            style={{ background: `linear-gradient(to right, #374151 ${volume * 100}%, #e5e7eb ${volume * 100}%)` }}
                            aria-label="Volume slider"
                        />
                    </div>
                    {/* Optional Action Buttons */}
                    <div className="hidden lg:flex items-center gap-1 md:gap-1.5">
                        <button 
                            className={`p-1 text-black hover:text-gray-700 disabled:opacity-50 transition-colors`} 
                            disabled={!hasTrack} 
                            aria-label="Share"
                        >
                            <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <button 
                            className={`p-1 text-black hover:text-gray-700 disabled:opacity-50 transition-colors`} 
                            disabled={!hasTrack} 
                            aria-label="Download"
                        >
                            <Download className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <button 
                            className={`p-1 text-black hover:text-gray-700 disabled:opacity-50 transition-colors`} 
                            disabled={!hasTrack} 
                            aria-label="More options"
                        >
                            <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Globalplayer;