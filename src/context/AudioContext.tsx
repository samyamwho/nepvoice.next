'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AudioTrackInfo {
    id: string;
    title: string;
    speaker?: string;
    imageUrl?: string;
    audioUrl: string;
    createdAt?: string;
}

interface AudioContextType {
    currentTrack: AudioTrackInfo | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isLoading: boolean;
    error: string | null;
    audioUrl: string | null;
    trackInfo: AudioTrackInfo | null;
    setTrack: (track: AudioTrackInfo | null) => void;
    playPause: () => void;
    seek: (percentage: number) => void;
    setVolume: (volume: number) => void;
    forward: () => void;
    backward: () => void;
    playAudio: (url: string, trackInfo?: AudioTrackInfo) => void;
    pauseAudio: () => void;
    seekAudio: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<AudioTrackInfo | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [trackInfo, setTrackInfo] = useState<AudioTrackInfo | null>(null);

    const setTrack = useCallback((track: AudioTrackInfo | null) => {
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setError(null);
    }, []);

    const playPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const seek = useCallback((percentage: number) => {
        setCurrentTime((percentage / 100) * duration);
    }, [duration]);

    const forward = useCallback(() => {
        setCurrentTime(prev => Math.min(prev + 10, duration));
    }, [duration]);

    const backward = useCallback(() => {
        setCurrentTime(prev => Math.max(prev - 10, 0));
    }, []);

    const playAudio = useCallback((url: string, trackInfo?: AudioTrackInfo) => {
        setAudioUrl(url);
        if (trackInfo) {
            setTrackInfo(trackInfo);
        }
        setIsPlaying(true);
    }, []);

    const pauseAudio = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const seekAudio = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    return (
        <AudioContext.Provider
            value={{
                currentTrack,
                isPlaying,
                currentTime,
                duration,
                volume,
                isLoading,
                error,
                audioUrl,
                trackInfo,
                setTrack,
                playPause,
                seek,
                setVolume,
                forward,
                backward,
                playAudio,
                pauseAudio,
                seekAudio,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}; 