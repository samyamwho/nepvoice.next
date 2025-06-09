'use client'; // Mark as a Client Component since it uses hooks like useState

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Adjust path to your project structure
import { ChevronRight, Sun, Link, Languages, File, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path to your project structure
import Globalplayer from '@/components/shared/Globalplayer'; // Adjust path to your project structure

const YoutubeTranscribe: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Use Next.js router

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenUrlModal = () => setIsUrlModalOpen(true);
  const handleCloseUrlModal = () => setIsUrlModalOpen(false);

  // Handle navigation to TranscribeNow page for file
  const handleTranscribeNow = () => {
    if (uploadedFile) {
      router.push('/main/youtubetranscriber/transcribenow', {
        // Next.js 13+ App Router doesn't use `state` like react-router-dom.
        // You can pass data via query params or other state management (e.g., Redux, Context).
        // For simplicity, we'll assume the file is handled elsewhere (e.g., global state or server).
      });
    }
  };

  // Handle navigation to TranscribeNow page for YouTube URL
  const handleTranscribeUrl = () => {
    if (youtubeUrl) {
      router.push(`/main/youtubetranscriber/transcribenow?youtubeUrl=${encodeURIComponent(youtubeUrl)}`);
      setYoutubeUrl('');
      handleCloseUrlModal();
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
      handleCloseModal();
    }
  };

  // Handle file selection via file explorer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      handleCloseModal();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Globalplayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        volume={0}
        onPlayPause={() => {
          throw new Error('Function not implemented.');
        }}
        onSeek={(_value: number) => {
          throw new Error('Function not implemented.');
        }}
        onVolumeChange={(_value: number) => {
          throw new Error('Function not implemented.');
        }}
        onForward={() => {
          throw new Error('Function not implemented.');
        }}
        onBackward={() => {
          throw new Error('Function not implemented.');
        }}
      />
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
        <div
          className={`flex items-center justify-center h-120 px-4 transition-all duration-300 ${
            isModalOpen || isUrlModalOpen ? 'blur-sm' : ''
          }`}
        >
          <div className="max-w-3xl w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-normal text-gray-900">
                Youtube Transcribe Generator
              </h1>
              <Button
                onClick={handleOpenUrlModal}
                className="flex items-center gap-2 font-normal text-white hover:text-white"
              >
                <Link size={16} />
                Transcribe URL
              </Button>
            </div>
            <p className="text-gray-600 mb-6 text-start font-[Avenir]">
              Transcribe audio and video files with our industry-leading ASR model.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[250px]">
              {uploadedFile ? (
                <div className="flex flex-col items-center">
                  <File size={24} className="text-gray-400 mb-4" />
                  <p className="text-sm text-black mb-4">
                    Uploaded File: <span className="font-medium">{uploadedFile.name}</span>
                  </p>
                  <button
                    onClick={handleTranscribeNow}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <File size={16} />
                    Transcribe Now
                  </button>
                </div>
              ) : (
                <>
                  <Languages size={24} className="text-gray-400 mb-4" />
                  <p className="text-sm text-black mb-4">
                    No transcribed files uploaded.
                    <br />
                    Try uploading a file to transcribe.
                  </p>
                  <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <File size={16} />
                    Upload files
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* File Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transcribe files
              </h2>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 cursor-pointer transition-colors ${
                  isDragging ? 'border-gray-500 bg-gray-100' : 'border-gray-300'
                }`}
              >
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload, or drag and drop
                  <br />
                  Audio or video files, up to 1000MB each
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/*,video/*"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Primary language
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    defaultValue="Detect"
                  >
                    <option>Detect</option>
                    <option>English</option>
                    <option>Nepali</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">
                    Tag audio events
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gray-600 transition-colors">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                  </label>
                </div>
              </div>
              <button
                onClick={handleUploadClick}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                <Upload size={16} />
                Upload file
              </button>
            </div>
          </div>
        )}

        {/* URL Input Modal */}
        {isUrlModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                onClick={handleCloseUrlModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transcribe YouTube URL
              </h2>
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-1">
                  Enter YouTube URL
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <button
                onClick={handleTranscribeUrl}
                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                <Link size={16} />
                Transcribe URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubeTranscribe;