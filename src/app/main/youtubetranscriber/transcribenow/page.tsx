'use client';

import React, { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import YouTube, { YouTubeProps } from 'react-youtube';// Adjust path to your project structure
import { ChevronRight, Sun, Maximize, Minimize, PictureInPicture, FastForward, Clock, Play, PauseIcon, ForwardIcon, Volume2Icon, VolumeXIcon, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path to your project structure

// Placeholder transcription data with English and Nepali
const placeholderTranscription = [
  { timestamp: '00:00:07.438', text: 'Beautiful scenery', textNepali: 'सुन्दर दृश्य' },
  { timestamp: '00:00:24.596', text: 'After school', textNepali: 'स्कूल पछि' },
  { timestamp: '00:00:25.761', text: 'No good', textNepali: 'राम्रो छैन' },
  { timestamp: '00:00:26.479', text: 'I start working today.', textNepali: 'म आजबाट काम सुरु गर्छु।' },
  { timestamp: '00:00:31.689', text: "I'm sick of this countryside already.", textNepali: 'मलाई यो गाउँघरबाट पहिले नै वाक्क लागिसक्यो।' },
  { timestamp: '00:00:33.527', text: 'I hate this life.', textNepali: 'मलाई यो जीवन मन पर्दैन।' },
  { timestamp: '00:00:33.927', text: 'In the next life, please let me be a handsome man in Tokyo.', textNepali: 'अर्को जन्ममा, कृपया मलाई टोकियोमा सुन्दर पुरुष बनाइदिनुहोस्।' },
  { timestamp: '00:00:38.112', text: 'One with charm, money, and endless ramen.', textNepali: 'आकर्षण, पैसा र असीमित रमेन भएको।' },
  { timestamp: '00:00:41.870', text: 'I’d live in Shibuya, take late trains home.', textNepali: 'म शिबुयामा बस्नेछु, राति रेल चढेर घर फर्कनेछु।' },
  { timestamp: '00:00:45.223', text: 'No rice fields. No nosy neighbors.', textNepali: 'धानखेत छैन। छिमेकीहरू पनि कुरा काट्ने छैनन्।' },
  { timestamp: '00:00:48.562', text: 'Just neon lights and anonymity.', textNepali: 'केवल नियोन बत्तीहरू र गुमनामता।' },
  { timestamp: '00:00:52.347', text: 'Is that too much to ask?', textNepali: 'के यो धेरै माग्नु हो?' },
  { timestamp: '00:00:55.008', text: 'Maybe this life is just a detour.', textNepali: 'सायद यो जीवन केवल एक घुमाउरो बाटो हो।' },
  { timestamp: '00:00:58.437', text: "Or maybe... I'm just dreaming again.", textNepali: 'वा सायद... म फेरि सपना देखिरहेको छु।' },
];

const TranscribeNow: React.FC = () => {
  const searchParams = useSearchParams();
  const youtubeUrl = searchParams.get('youtubeUrl');
  const fileId = searchParams.get('fileId'); // Assume file ID is passed if uploaded
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<YouTube>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('Bilingual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Video control functions
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (youtubePlayerRef.current) {
      const player = youtubePlayerRef.current.internalPlayer;
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    } else if (youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.setVolume(newVolume * 100);
    }
  };

  const handleSeek = (percent: number) => {
    if (videoRef.current) {
      const newTime = (percent / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (youtubePlayerRef.current) {
      const newTime = (percent / 100) * duration;
      youtubePlayerRef.current.internalPlayer.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.getCurrentTime().then((current: number) => {
        const newTime = Math.min(current + 10, duration);
        youtubePlayerRef.current!.internalPlayer.seekTo(newTime, true);
        setCurrentTime(newTime);
      });
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.getCurrentTime().then((current: number) => {
        const newTime = Math.max(current - 10, 0);
        youtubePlayerRef.current!.internalPlayer.seekTo(newTime, true);
        setCurrentTime(newTime);
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onYouTubeReady = (event: { target: any }) => {
    event.target.getDuration().then((dur: number) => setDuration(dur));
  };

  const onYouTubeStateChange = (event: { data: number }) => {
    if (event.data === 1) {
      // Playing
      setIsPlaying(true);
      const interval = setInterval(() => {
        youtubePlayerRef.current?.internalPlayer.getCurrentTime().then((time: number) => {
          setCurrentTime(time);
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (event.data === 2 || event.data === 0) {
      // Paused or Ended
      setIsPlaying(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } else if (youtubePlayerRef.current) {
      // Fullscreen for YouTube iframe requires manual handling or CSS
      setIsFullscreen(!isFullscreen);
    }
  };

  // Picture-in-picture mode
  const handlePictureInPicture = async () => {
    if (videoRef.current && !document.pictureInPictureElement) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (error) {
        console.error('Failed to enter Picture-in-Picture mode:', error);
      }
    } else if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
    // Note: YouTube iframe PiP is handled by the browser natively
  };

  // Playback speed adjustment
  const handlePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    } else if (youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.setPlaybackRate(newRate);
    }
  };

  // Jump to timestamp
  const handleJumpToTimestamp = (timestamp: string) => {
    const [minutes, secondsWithMillis] = timestamp.split(':');
    const [seconds, millis] = secondsWithMillis.split('.');
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(millis) / 1000;
    if (videoRef.current) {
      videoRef.current.currentTime = totalSeconds;
      setCurrentTime(totalSeconds);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else if (youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.seekTo(totalSeconds, true);
      setCurrentTime(totalSeconds);
      if (!isPlaying) {
        youtubePlayerRef.current.internalPlayer.playVideo();
        setIsPlaying(true);
      }
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = youtubeUrl ? getYouTubeVideoId(youtubeUrl) : null;

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeFormatted = formatTime(currentTime);
  const durationFormatted = formatTime(duration);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Find the active transcript based on currentTime
  const getActiveTranscript = () => {
    if (!placeholderTranscription.length) return null;

    const currentSeconds = currentTime;

    for (let i = 0; i < placeholderTranscription.length; i++) {
      const entry = placeholderTranscription[i];
      const nextEntry = placeholderTranscription[i + 1];

      const [minutes, secondsWithMillis] = entry.timestamp.split(':');
      const [seconds, millis] = secondsWithMillis.split('.');
      const startSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(millis) / 1000;

      if (!nextEntry) {
        return currentSeconds >= startSeconds ? entry : null;
      }

      const [nextMinutes, nextSecondsWithMillis] = nextEntry.timestamp.split(':');
      const [nextSeconds, nextMillis] = nextSecondsWithMillis.split('.');
      const endSeconds = parseInt(nextMinutes) * 60 + parseInt(nextSeconds) + parseInt(nextMillis) / 1000;

      if (currentSeconds >= startSeconds && currentSeconds < endSeconds) {
        return entry;
      }
    }

    return null;
  };

  const activeTranscript = getActiveTranscript();

  // YouTube player options
  const youtubeOpts: YouTubeProps['opts'] = {
    height: '315',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Disable default YouTube controls
      enablejsapi: 1,
    },
  };

  return (
    <div className="flex h-screen text-white">
      <div className="flex-1 min-h-screen font-normal w-full">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 rounded-full p-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#0088cc] text-white">
                New
              </span>
            </div>
            <span className="text-sm text-black">
              Creating your Professional Voice Clone just got easier
            </span>
            <ChevronRight size={16} />
          </div>
          <button className="rounded-full p-2 hover:bg-gray-100 bg-black">
            <Sun size={18} className="text-white" />
          </button>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left: Video Player with Integrated Controls */}
          <div className="w-1/2 p-4 flex flex-col items-center bg-gray-100 relative">
            {fileId ? (
              <div className="w-full relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                >
                  <source src={`/api/file/${fileId}`} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
                {/* Transcript Overlay */}
                {activeTranscript && (
                  <div className="absolute bottom-20 left-0 right-0 mx-4 bg-black/70 text-white rounded-lg p-3">
                    {(selectedLanguage === 'Bilingual' || selectedLanguage === 'English') && (
                      <p className="text-sm">{activeTranscript.text}</p>
                    )}
                    {(selectedLanguage === 'Bilingual' || selectedLanguage === 'Nepali') && (
                      <p className="text-sm mt-1">{activeTranscript.textNepali}</p>
                    )}
                  </div>
                )}
                {/* Integrated Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                  <div className="flex flex-col">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-12 text-right">{currentTimeFormatted}</span>
                      <div className="relative w-full">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={(e) => handleSeek(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-[#0088cc]"
                          style={{
                            background: `linear-gradient(to right, #1db954 ${progressPercent}%, #4b4b4b ${progressPercent}%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs w-12">{durationFormatted}</span>
                    </div>
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBackward}
                          className="text-white hover:text-gray-300"
                          aria-label="Rewind 10 seconds"
                        >
                          <Undo2 size={20} />
                        </button>
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-gray-300"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <PauseIcon size={24} /> : <Play size={24} />}
                        </button>
                        <button
                          onClick={handleForward}
                          className="text-white hover:text-gray-300"
                          aria-label="Forward 10 seconds"
                        >
                          <ForwardIcon size={20} />
                        </button>
                        <button className="text-white hover:text-gray-300">
                          {volume > 0 ? <Volume2Icon size={20} /> : <VolumeXIcon size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-[#0088cc]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePlaybackRate}
                          className="text-white hover:text-gray-300 flex items-center gap-1"
                          aria-label="Adjust playback speed"
                        >
                          <FastForward size={20} />
                          <span className="text-xs">{playbackRate}x</span>
                        </button>
                        <button
                          onClick={handlePictureInPicture}
                          className="text-white hover:text-gray-300"
                          aria-label="Toggle Picture-in-Picture"
                        >
                          <PictureInPicture size={20} />
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-gray-300"
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        >
                          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : youtubeUrl && videoId ? (
              <div className="w-full relative">
                <YouTube
                  videoId={videoId}
                  opts={youtubeOpts}
                  onReady={onYouTubeReady}
                  onStateChange={onYouTubeStateChange}
                  className="rounded-lg"
                  ref={youtubePlayerRef}
                />
                {/* Transcript Overlay */}
                {activeTranscript && (
                  <div className="absolute bottom-20 left-0 right-0 mx-4 bg-black/70 text-white rounded-lg p-3">
                    {(selectedLanguage === 'Bilingual' || selectedLanguage === 'English') && (
                      <p className="text-sm">{activeTranscript.text}</p>
                    )}
                    {(selectedLanguage === 'Bilingual' || selectedLanguage === 'Nepali') && (
                      <p className="text-sm mt-1">{activeTranscript.textNepali}</p>
                    )}
                  </div>
                )}
                {/* Integrated Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-12 text-right">{currentTimeFormatted}</span>
                      <div className="relative w-full">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={(e) => handleSeek(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-[#0088cc]"
                          style={{
                            background: `linear-gradient(to right, #1db954 ${progressPercent}%, #4b4b4b ${progressPercent}%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs w-12">{durationFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBackward}
                          className="text-white hover:text-gray-300"
                          aria-label="Rewind 10 seconds"
                        >
                          <Undo2 size={20} />
                        </button>
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-gray-300"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <PauseIcon size={24} /> : <Play size={24} />}
                        </button>
                        <button
                          onClick={handleForward}
                          className="text-white hover:text-gray-300"
                          aria-label="Forward 10 seconds"
                        >
                          <ForwardIcon size={20} />
                        </button>
                        <button className="text-white hover:text-gray-300">
                          {volume > 0 ? <Volume2Icon size={20} /> : <VolumeXIcon size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-[#0088cc]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePlaybackRate}
                          className="text-white hover:text-gray-300 flex items-center gap-1"
                          aria-label="Adjust playback speed"
                        >
                          <FastForward size={20} />
                          <span className="text-xs">{playbackRate}x</span>
                        </button>
                        <button
                          onClick={handlePictureInPicture}
                          className="text-white hover:text-gray-300"
                          aria-label="Toggle Picture-in-Picture"
                        >
                          <PictureInPicture size={20} />
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-gray-300"
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        >
                          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No file or URL provided. Please go back and upload a file or enter a URL.
              </p>
            )}
          </div>

          {/* Right: Transcription */}
          <div className="w-1/2 p-4 bg-white border-l border-gray-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-black font-[Avenir]">
                Transcription
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-black text-white text-sm rounded-md px-4 py-1"
                >
                  <option value="Bilingual">Bilingual</option>
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                </select>
                <Button className="bg-red-700 text-white hover:bg-black">
                  Start
                </Button>
              </div>
            </div>
            {(fileId || youtubeUrl) ? (
              <div className="space-y-3">
                {placeholderTranscription.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-gray-50 border border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600 font-mono">
                        {entry.timestamp}
                      </span>
                      <button
                        onClick={() => handleJumpToTimestamp(entry.timestamp)}
                        className="text-black hover:text-gray-600"
                        aria-label={`Jump to ${entry.timestamp}`}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                    <div className="flex-1">
                      {(selectedLanguage === 'Bilingual' || selectedLanguage === 'English') && (
                        <p className="text-sm text-black">{entry.text}</p>
                      )}
                      {(selectedLanguage === 'Bilingual' || selectedLanguage === 'Nepali') && (
                        <p className="text-sm text-gray-700 mt-1">{entry.textNepali}</p>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-400 mt-4">
                  [Placeholder: Actual transcription will be implemented here]
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No transcription available. Please upload a file or enter a URL.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscribeNow;