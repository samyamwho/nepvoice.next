'use client';

// src/context/AudioContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioTrackInfo {
  id: string;
  title: string;
  speaker?: string;
  createdAt?: string;
  imageUrl?: string;
  audioUrl: string;
}

interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioUrl: string | null; // Original URL (http OR blob:identifier for local files)
  trackInfo: AudioTrackInfo | null;
  isLoading: boolean;
  error: string | null;

  playAudio: (url: string, trackInfo?: AudioTrackInfo) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  seekAudio: (time: number) => void; // Seeks to absolute time
  setVolume: (volume: number) => void;
  skipTime: (seconds: number) => void; // For forward/backward
  clearAudio: () => void; // To stop and clear player state
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1); // Local state for volume
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [trackInfo, setTrackInfo] = useState<AudioTrackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Cache for remote URLs (original URL -> Blob)
  const remoteUrlCache = useRef<Map<string, Blob>>(new Map());
  // Stores the currently active object URL (blob:...) for the audio element's src
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume; // Set initial volume

    const audioElement = audioRef.current;

    const handleTimeUpdate = () => audioElement && setCurrentTime(audioElement.currentTime);
    const handleLoadedMetadata = () => {
      if (audioElement) {
        setDuration(audioElement.duration);
        setIsLoading(false);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      // Optionally reset currentTime, or set to duration
      if (audioElement) setCurrentTime(0); // Reset for next play from start
    };
    const handlePlay = () => { setIsLoading(false); setIsPlaying(true); setError(null); };
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => audioElement && setVolumeState(audioElement.volume);
    const handleError = () => {
      console.error('Audio Element Error:', audioElement?.error);
      setError(`Audio Error: ${audioElement?.error?.message || 'Unknown error'}`);
      setIsPlaying(false);
      setIsLoading(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('volumechange', handleVolumeChange);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('waiting', handleWaiting);
    audioElement.addEventListener('canplay', handleCanPlay);

    return () => {
      audioElement.pause();
      // Remove all listeners
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      // ... (remove all others)
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      }
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount


  const playAudioInternal = useCallback(async (objectUrlToPlay: string, originalUrl: string, newTrackInfo?: AudioTrackInfo) => {
    if (!audioRef.current) return;

    // Revoke previous object URL if it exists and is different
    if (currentObjectUrlRef.current && currentObjectUrlRef.current !== objectUrlToPlay) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
    }
    currentObjectUrlRef.current = objectUrlToPlay;

    audioRef.current.src = objectUrlToPlay;
    setAudioUrl(originalUrl); // Store the original URL (remote or blob:id)
    setTrackInfo(newTrackInfo || null);
    setCurrentTime(0);
    setDuration(0); // Will be updated by 'loadedmetadata'
    setIsLoading(true);
    setError(null);

    try {
      await audioRef.current.play();
    } catch (err) {
      console.error('Error initiating play:', err);
      setError(`Play initiation failed: ${(err as Error).message}`);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, []);

  const playAudio = useCallback(async (url: string, newTrackInfo?: AudioTrackInfo) => {
    if (!audioRef.current) return;

    // If it's the same original URL and just paused, resume it.
    if (audioUrl === url && audioRef.current.paused && audioRef.current.src && audioRef.current.currentTime > 0) {
      resumeAudio();
      if (newTrackInfo) setTrackInfo(newTrackInfo); // Update track info if changed
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let objectUrlToPlay: string;

      if (url.startsWith('blob:')) {
        // It's already a blob object URL (from local file/recording)
        objectUrlToPlay = url;
      } else {
        // It's a remote URL, check cache or fetch
        if (remoteUrlCache.current.has(url)) {
          const blob = remoteUrlCache.current.get(url)!;
          objectUrlToPlay = URL.createObjectURL(blob);
        } else {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
          const blob = await response.blob();
          remoteUrlCache.current.set(url, blob); // Cache the fetched blob
          objectUrlToPlay = URL.createObjectURL(blob);
        }
      }
      await playAudioInternal(objectUrlToPlay, url, newTrackInfo);

    } catch (err) {
      console.error('Error in playAudio:', err);
      setError(`Error loading audio: ${(err as Error).message}`);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [audioUrl, playAudioInternal]);


  const pauseAudio = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const resumeAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      setIsLoading(true); // Indicate attempt to resume
      audioRef.current.play().catch(err => {
        console.error('Error resuming play:', err);
        setError(`Resume failed: ${(err as Error).message}`);
        setIsLoading(false);
      });
    }
  }, []);
  
  const seekAudio = useCallback((time: number) => {
    if (audioRef.current && isFinite(time) && duration > 0) {
      const newTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime); // Optimistic update
    }
  }, [duration]);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioRef.current.volume = clampedVolume;
      // volume state will be updated by 'volumechange' event listener
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current && duration > 0) {
        const newTime = audioRef.current.currentTime + seconds;
        seekAudio(newTime); // Use seekAudio for bounds checking
    }
  }, [duration, seekAudio]);

  const clearAudio = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        // audioRef.current.load(); // Can be problematic
    }
    if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
    }
    setAudioUrl(null);
    setTrackInfo(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        volume,
        audioUrl,
        trackInfo,
        isLoading,
        error,
        playAudio,
        pauseAudio,
        resumeAudio,
        seekAudio,
        setVolume,
        skipTime,
        clearAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}