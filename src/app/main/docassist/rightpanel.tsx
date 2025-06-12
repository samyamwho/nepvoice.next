  'use client';

  import React, { useState, useCallback, useRef } from 'react'; // Added useRef
  import { FileText, Eye, Trash2, LayoutDashboard, Settings, FolderOpen, UploadCloud } from 'lucide-react';
  import { useRouter } from 'next/navigation';

  interface UploadedFile {
    file: File;
    pdf_id?: number;
  }

  interface Message {
    type: 'user' | 'bot';
    content: string;
    documents?: any;
  }

  interface RightPanelProps {
    activeTab: 'settings' | 'files';
    setActiveTab: React.Dispatch<React.SetStateAction<'settings' | 'files'>>;
    selectedFiles: UploadedFile[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onViewPDF: (file: UploadedFile) => void;
    onViewMultiplePDFs?: (startingFile?: UploadedFile) => void;
  }

  const UPLOAD_FILE_ENDPOINT = process.env.NEXT_PUBLIC_PDF_ENDPOINT;

  export default function RightPanel({
    activeTab,
    setActiveTab,
    selectedFiles,
    setSelectedFiles,
    showToast,
    setMessages,
    onViewPDF,
  }: RightPanelProps) {
    const router = useRouter();
    
    const [autoScroll, setAutoScroll] = useState(true);
    const [voiceInput, setVoiceInput] = useState(true);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

    const handleDeleteFile = useCallback((fileToDelete: UploadedFile) => {
      setSelectedFiles(prev =>
        prev.filter(item =>
          (item.pdf_id ?? item.file.name + item.file.size) !== (fileToDelete.pdf_id ?? fileToDelete.file.name + fileToDelete.file.size)
        )
      );
      showToast('PDF removed successfully', 'success');
    }, [setSelectedFiles, showToast]);

    const handleNavigateToDashboard = useCallback(() => {
      router.push('/main/docassist/docdashboard');
    }, [router]);

    const handleClearChat = useCallback(() => {
      setMessages([]);
      showToast('Chat history cleared', 'success');
    }, [setMessages, showToast]);

    const handleTabChange = useCallback((tab: 'settings' | 'files') => {
      setActiveTab(tab);
    }, [setActiveTab]);

    const processAndUploadFiles = useCallback(async (filesToProcess: File[]) => {
      if (!UPLOAD_FILE_ENDPOINT) {
        showToast('Upload endpoint is not configured.', 'error');
        console.error('Error: NEXT_PUBLIC_PDF_ENDPOINT is not set.');
        return;
      }

      if (!filesToProcess || filesToProcess.length === 0) {
        // This case should ideally be caught before calling, but as a safeguard:
        // showToast('No files were selected or dropped.', 'info');
        return;
      }

      const pdfFiles = Array.from(filesToProcess).filter(
        (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );

      if (pdfFiles.length === 0) {
        showToast('No PDF files found. Please select or drop PDF files only.', 'error');
        return;
      }

      const currentFileCount = selectedFiles.length;
      if (currentFileCount + pdfFiles.length > 10) {
        showToast(`You can upload a maximum of 10 PDFs. You have ${currentFileCount} and tried to add ${pdfFiles.length}.`, 'error');
        return;
      }
      
      let attemptedUploadCount = 0;
      let successfulUploadCount = 0;
      const newFilesBatched: UploadedFile[] = [];

      for (const file of pdfFiles) {
        attemptedUploadCount++;
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showToast(`File "${file.name}" exceeds the 50MB size limit.`, 'error');
            continue;
        }

        if (selectedFiles.some(sf => sf.file.name === file.name && sf.file.size === file.size) ||
            newFilesBatched.some(bf => bf.file.name === file.name && bf.file.size === file.size)) {
          showToast(`File "${file.name}" appears to be a duplicate or already in the list.`, 'info');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
          showToast(`Uploading ${file.name}...`, 'info');
          const response = await fetch(UPLOAD_FILE_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
          });

          if (!response.ok) {
            let errorMsg = `Failed to upload ${file.name}.`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.detail || errorMsg;
            } catch (e) {
                errorMsg = `Upload failed for ${file.name} with status: ${response.status}`;
            }
            throw new Error(errorMsg);
          }

          const result = await response.json();
          const newUploadedFile: UploadedFile = {
            file: file,
            pdf_id: result.pdf_id,
          };
          
          newFilesBatched.push(newUploadedFile);
          successfulUploadCount++;
          
        } catch (error) {
          console.error('Upload error for file:', file.name, error);
          showToast(error instanceof Error ? error.message : `Error uploading ${file.name}`, 'error');
        }
      }

      if (newFilesBatched.length > 0) {
        setSelectedFiles(prev => {
          const trulyUniqueNewFiles = newFilesBatched.filter(newFile => 
              !prev.some(existingFile => 
                  (newFile.pdf_id && existingFile.pdf_id === newFile.pdf_id) ||
                  (existingFile.file.name === newFile.file.name && existingFile.file.size === newFile.file.size)
              )
          );
          if (trulyUniqueNewFiles.length < newFilesBatched.length) {
              const diff = newFilesBatched.length - trulyUniqueNewFiles.length;
              showToast(`${diff} file(s) were already present or had conflicting IDs after server response.`, 'info');
          }
          return [...prev, ...trulyUniqueNewFiles];
        });
      }

      if (successfulUploadCount > 0) {
        showToast(`${successfulUploadCount} PDF(s) uploaded successfully.`, 'success');
      } else if (attemptedUploadCount > 0) {
        showToast('No new PDFs were added. Check for errors, duplicates, or size limits.', 'info');
      }

    }, [selectedFiles, setSelectedFiles, showToast]);


    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);
      const droppedFiles = Array.from(event.dataTransfer.files);
      if (droppedFiles.length > 0) {
        await processAndUploadFiles(droppedFiles);
      }
    }, [processAndUploadFiles, setIsDraggingOver]);

    const handleFileInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
          await processAndUploadFiles(files);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset input for re-selection of same file
        }
      }
    }, [processAndUploadFiles]);

    const handleUploadAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      // Prevent triggering file input if a button/interactive element within the area was clicked
      if ((event.target as HTMLElement).closest('button, a, input[type="checkbox"]')) {
        return;
      }
      fileInputRef.current?.click();
    }, []);


    return (
      <div className="w-full md:w-[400px] bg-white border-l border-gray-200 p-2 md:p-6 flex flex-col h-full items-stretch">
        {/* Tab Navigation */}
        <div className="w-full flex flex-row items-center justify-between border-b border-gray-200 pb-2 md:pb-3 mb-2 gap-2">
          {/* ... Tab buttons and Dashboard button (no changes here) ... */}
          <div className="flex items-center w-full gap-2 min-w-0" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="settings-panel"
              className={`flex-1 min-w-0 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium relative transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('settings')}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'files'}
              aria-controls="files-panel"
              className={`flex-1 min-w-0 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium relative transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'files'
                  ? 'text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('files')}
            >
              Files
            </button>
          </div>
          <button
            className="flex-shrink-0 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-medium relative bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
            onClick={handleNavigateToDashboard}
            aria-label="Navigate to Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full mt-0 overflow-y-auto flex flex-col items-stretch" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {activeTab === 'settings' && (
            <div 
              id="settings-panel"
              role="tabpanel"
              aria-labelledby="settings-tab"
              className="w-full flex flex-col space-y-4 items-stretch"
            >
              {/* PDF Management Section */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mt-2 w-full">
                <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  PDF Management
                </h3>

                {/* Unified Clickable Drag-and-Drop Area & File List Container */}
                <div
                  onClick={handleUploadAreaClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full p-4 md:p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ease-in-out
                    ${isDraggingOver ? 'border-blue-600 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                  aria-label="Drag and drop PDF files here, or click to upload"
                  role="button" // Make it clear it's interactive
                  tabIndex={0} // Make it focusable
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadAreaClick(e as any); }} // Keyboard activation
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="application/pdf,.pdf" // Common accept values
                    multiple
                    onChange={handleFileInputChange}
                    aria-hidden="true"
                  />
                  <UploadCloud className={`mx-auto h-10 w-10 md:h-12 md:w-12 mb-2 md:mb-3 transition-all duration-200 ease-in-out pointer-events-none ${isDraggingOver ? 'text-blue-600 scale-110' : 'text-gray-400'}`} aria-hidden="true" />
                  <p className={`text-sm md:text-base font-medium transition-colors duration-200 ease-in-out pointer-events-none ${isDraggingOver ? 'text-blue-700' : 'text-gray-700'}`}>
                    {isDraggingOver ? "Drop PDF(s) to upload!" : "Drag & drop PDF files, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 mb-4 pointer-events-none">Max 50MB per file. Only .pdf accepted.</p>
                  
                  {/* File List or Empty Message - now INSIDE the dashed box */}
                  {selectedFiles.length === 0 ? (
                    <div className="text-center py-4 border-t border-gray-200 mt-4 pointer-events-none">
                      <p className="text-gray-500 text-sm font-medium">No PDFs currently managed.</p>
                      <p className="text-gray-400 text-xs mt-1">Upload files to see them listed here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 text-left">
                      {selectedFiles.map((uploadedFile) => (
                        <div 
                          key={uploadedFile.pdf_id || uploadedFile.file.name + uploadedFile.file.size}
                          className="w-full bg-white rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                          // onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent if necessary, handled by handleUploadAreaClick check
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                              <span className="text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] font-medium" title={uploadedFile.file.name}>
                                {uploadedFile.file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); onViewPDF(uploadedFile); }}
                                className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                                aria-label={`View PDF: ${uploadedFile.file.name}`}
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(uploadedFile); }}
                                className="bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                                aria-label={`Remove PDF: ${uploadedFile.file.name}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Preferences Section (no changes here) */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-full">
                <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Chat Preferences
                </h3>
                <div className="space-y-4">
                  {/* ... Auto-scroll and Voice input toggles ... */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium text-sm">Auto-scroll to new messages</span>
                      <span className="text-gray-500 text-xs">Automatically scroll to latest messages</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Auto-scroll to new messages"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium text-sm">Enable voice input</span>
                      <span className="text-gray-500 text-xs">Use voice commands for chat</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceInput}
                        onChange={(e) => setVoiceInput(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Enable voice input"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Chat Actions Section (no changes here) */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-full mb-4">
                <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Chat Actions
                </h3>
                <button
                  onClick={handleClearChat}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg px-4 py-2 md:py-3 shadow-lg hover:from-gray-800 hover:to-black transition-all duration-300 text-sm font-medium"
                  aria-label="Clear chat history"
                >
                  Clear Chat History
                </button>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div 
              id="files-panel"
              role="tabpanel"
              aria-labelledby="files-tab"
              className="w-full flex flex-col space-y-4 items-stretch"
            >
              {/* This 'Files' tab now largely duplicates the display functionality from the Settings tab's PDF Management.
                  You might want to simplify this tab or have it show different information/actions if the primary
                  PDF management (upload, view, delete) is now consolidated in the Settings tab.
                  For now, I'll keep its structure similar for listing files.
              */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mt-2 w-full mb-4">
                <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  Uploaded PDFs
                </h3>
                {selectedFiles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-500 text-sm font-medium">No PDFs uploaded yet</p>
                    <p className="text-gray-400 text-xs mt-2">Go to the Settings tab to upload and manage PDFs.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFiles.map((uploadedFile) => (
                      <div 
                        key={uploadedFile.pdf_id || uploadedFile.file.name + uploadedFile.file.size}
                        className="w-full bg-white rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] font-medium" title={uploadedFile.file.name}>
                              {uploadedFile.file.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button
                              onClick={() => onViewPDF(uploadedFile)}
                              className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                              aria-label={`View PDF: ${uploadedFile.file.name}`}
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(uploadedFile)} // Assuming handleDeleteFile is accessible or defined for this tab as well
                              className="bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                              aria-label={`Remove PDF: ${uploadedFile.file.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }