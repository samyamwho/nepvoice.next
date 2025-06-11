// app/test/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

// Use the proxy API route instead of direct call
const ASR_ENDPOINT = '/api/asr-proxy';

// Original endpoint (commented out due to HTTPS issues)
// const ASR_ENDPOINT = 'https://demo.wiseyak.com/feature/asr';

export default function ASRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('english');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Ensure event and event.target exist before trying to access files
    if (event?.target?.files?.[0]) {
      setFile(event.target.files[0]);
      setTranscript('');
      setError('');
    } else {
      setFile(null); // Clear file if no file is selected or event is unusual
    }
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setTranscript('');

    const formData = new FormData();
    formData.append('audio_file', file);
    const url = `${ASR_ENDPOINT}?lang=${language}`;

    try {
      console.log('Making request to:', url); // Debug log
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json',
        },
        // Remove credentials for now to avoid CORS issues
        // credentials: 'include',
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          const detail = errorData.detail || errorData.message || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
          errorMsg = `API Error: ${detail} (Status: ${response.status})`;
        } catch (e) {
          console.log("Failed to parse error response as JSON:", e);
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      setTranscript(result);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'An unknown error occurred during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="asr-container">
      <h1 className="asr-title">
        Audio Transcription Service
      </h1>
      <form onSubmit={handleSubmit} className="asr-form">
        <div>
          <label htmlFor="language" className="asr-label">
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="asr-select"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            {/* Add other languages as supported */}
          </select>
        </div>

        <div>
          <label htmlFor="audioFile" className="asr-label">
            Choose an audio file:
          </label>
          <input
            type="file"
            id="audioFile"
            accept="audio/*"
            onChange={handleFileChange}
            className="asr-input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className={`asr-button ${(isLoading || !file) ? 'asr-button-disabled' : ''}`}
        >
          {isLoading ? 'Uploading & Transcribing...' : 'Upload and Transcribe'}
        </button>
      </form>

      {error && (
        <div className="asr-error">
          <p className="asr-error-title">Error:</p>
          <p className="asr-error-message">{error}</p>
        </div>
      )}

      {transcript && (
        <div className="asr-transcript">
          <h2 className="asr-transcript-title">
            Transcript:
          </h2>
          <p className="asr-transcript-content">
            {transcript}
          </p>
        </div>
      )}

      <style jsx>{`
        .asr-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          background-color: #f0f2f5;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          color: #333;
        }

        .asr-title {
          text-align: center;
          margin-bottom: 25px;
          color: #1a2b4d;
        }

        .asr-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          background-color: #ffffff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .asr-label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #555;
        }

        .asr-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          background-color: #fff;
          color: #333;
        }

        .asr-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          background-color: #fff;
          color: #333;
        }

        .asr-button {
          padding: 12px 20px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }

        .asr-button:hover:not(.asr-button-disabled) {
          background-color: #0056b3;
        }

        .asr-button-disabled {
          cursor: not-allowed;
          background-color: #adb5bd;
          opacity: 0.7;
        }

        .asr-error {
          margin-top: 20px;
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 15px;
          border-radius: 4px;
        }

        .asr-error-title {
          margin: 0;
          font-weight: bold;
        }

        .asr-error-message {
          margin: 5px 0 0 0;
        }

        .asr-transcript {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #cce5ff;
          background-color: #e7f3ff;
          border-radius: 4px;
        }

        .asr-transcript-title {
          margin-top: 0;
          margin-bottom: 10px;
          color: #004085;
        }

        .asr-transcript-content {
          white-space: pre-wrap;
          margin: 0;
          padding: 12px;
          background-color: #ffffff;
          border: 1px solid #bee5eb;
          border-radius: 4px;
          color: #333;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}