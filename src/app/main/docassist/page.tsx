'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, ChevronLeft, ChevronRight, Plus, Mic } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const RightPanel = dynamic(() => import('./rightpanel'), { ssr: false });
const PdfPopup = dynamic(() => import('./pdfpopup'), { ssr: false });
const DocDashboard = dynamic(() => import('./docdashboard/page'), { ssr: false });

export interface HighlightItem {
  page: number;
  keywords: string[];
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  documents?: Array<{
    pdf_id: number;
    total_pages: number;
    chunk: Array<{
      chunk_number: number;
      chunk: string;
      page_number: number;
    }>;
  }>;
}

interface UploadedFile {
  file: File;
  pdf_id?: number;
}

interface PDFNavigationItem {
  file?: UploadedFile;
  url?: string;
  highlights?: HighlightItem[];
  totalPages?: number;
  title?: string;
  isReference?: boolean;
}

class FetchError extends Error {
  response?: Response;
  data?: any;

  constructor(message: string, response?: Response, data?: any) {
    super(message);
    this.name = 'FetchError';
    this.response = response;
    this.data = data;
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

export default function DocAssist() {
  
  const UPLOAD_FILE_ENDPOINT = process.env.NEXT_PUBLIC_PDF_ENDPOINT;
  const CHATBOT_ENDPOINT = process.env.NEXT_PUBLIC_CHATBOT_ENDPOINT;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'files'>('settings');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfNavigationList, setPdfNavigationList] = useState<PDFNavigationItem[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filesForUpload, setFilesForUpload] = useState<File[]>([]);
  const [pdfChatMessages, setPdfChatMessages] = useState<{ type: 'user' | 'bot', content: string }[]>([]);
  const [pdfChatInput, setPdfChatInput] = useState('');
  const [pdfChatLoading, setPdfChatLoading] = useState(false);
  const [referencePdfs, setReferencePdfs] = useState<Message['documents']>([]);
  

  // Add dashboard state
  const [showDashboard, setShowDashboard] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textAreaRef.current) textAreaRef.current.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextAreaHeight();
  }, [inputMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === 'bot' && lastMsg.documents) {
        setReferencePdfs(prev => {
          const existingIds = new Set((prev ?? []).map(doc => doc.pdf_id));
          const newDocs = (lastMsg.documents ?? []).filter(doc => !existingIds.has(doc.pdf_id));
          return [...(prev ?? []), ...(newDocs ?? [])];
        });
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    textArea.style.height = 'auto';
    const newHeight = Math.min(textArea.scrollHeight, 120);
    textArea.style.height = `${newHeight}px`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      closeButton: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const handlePdfUpload = async (uploadFiles?: File[]) => {
    const filesToProcess = uploadFiles ?? filesForUpload;
    if (filesToProcess.length === 0) {
      showToast('Please select at least one PDF file to upload.', 'error');
      return;
    }

    const invalidFiles = filesToProcess.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      showToast('Only PDF files are allowed. Please remove other file types.', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    filesToProcess.forEach(file => formData.append('files', file));
    
    if (!UPLOAD_FILE_ENDPOINT) {
        showToast('PDF upload endpoint is not configured.', 'error');
        setLoading(false);
        return;
      }

    try {
      const response = await fetch(UPLOAD_FILE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new FetchError(`HTTP error! status: ${response.status}`, response, errorData);
      }

      const responseData = await response.json();
      const newlyUploadedFiles = filesToProcess.map((file, index) => ({
        file: file,
        pdf_id: responseData?.pdf_ids?.[index] || undefined
      }));

      setSelectedFiles(prev => [...prev, ...newlyUploadedFiles]);
      showToast(`Successfully uploaded ${filesToProcess.length} PDF${filesToProcess.length > 1 ? 's' : ''}!`, 'success');
      setFilesForUpload([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('PDF upload error:', error);
      if (error instanceof FetchError) {
        if (error.response?.status === 413) {
          showToast('File size too large. Please upload smaller files.', 'error');
        } else if (error.response?.status === 415) {
          showToast('Invalid file type. Please upload PDF files only.', 'error');
        } else {
          showToast(`Failed to upload PDFs. ${error.message}. Please try again.`, 'error');
        }
      } else {
        showToast(`An unexpected error occurred during upload. ${(error as Error).message || 'Please try again.'}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (!inputMessage.trim()) {
      showToast('Please enter a message before sending.', 'error');
      return;
    }

    const userMessageContent = inputMessage;
    setMessages(prev => [...prev, { type: 'user', content: userMessageContent }]);
    setInputMessage('');
    setLoading(true);

    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch(
        `${CHATBOT_ENDPOINT}?query=${encodeURIComponent(userMessageContent)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new FetchError(`HTTP error! status: ${response.status}`, response, errorData);
      }

      const responseData = await response.json();
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: responseData.response || "I couldn't find a relevant answer in the documents.",
          documents: responseData.documents
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof FetchError) {
        if (error.response?.status === 404) {
          showToast('No relevant information found in the documents.', 'error');
        } else if (error.response?.status === 500) {
          showToast('Server error. Please try again later.', 'error');
        } else {
          showToast(`Failed to get response. ${error.message}. Please try again.`, 'error');
        }
      } else {
        showToast(`An unexpected error occurred while sending message. ${(error as Error).message || 'Please try again.'}`, 'error');
      }
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: "Sorry, there was an error processing your request." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewPDF = (file: UploadedFile) => {
    const navigationList: PDFNavigationItem[] = [{
      file: file,
      title: file.file.name,
      isReference: false
    }];

    setPdfNavigationList(navigationList);
    setCurrentPdfIndex(0);
    setShowPDFViewer(true);
  };

  const handleViewPDFReference = async (pdfId: number, highlights: HighlightItem[], totalPages: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${UPLOAD_FILE_ENDPOINT}?pdf_id=${pdfId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new FetchError(`HTTP error! status: ${response.status}`, response);
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      const navigationList: PDFNavigationItem[] = [{
        url: fileUrl,
        highlights: highlights,
        totalPages: totalPages,
        title: `PDF #${pdfId}`,
        isReference: true
      }];

      setPdfNavigationList(navigationList);
      setCurrentPdfIndex(0);
      setShowPDFViewer(true);

    } catch (error) {
      console.error('Error fetching PDF for viewing:', error);
      showToast('Failed to load PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMultiplePDFs = (startingFile?: UploadedFile) => {
    const navigationList: PDFNavigationItem[] = selectedFiles.map(file => ({
      file: file,
      title: file.file.name,
      isReference: false
    }));

    const startingIndex = startingFile ?
      selectedFiles.findIndex(f => f === startingFile) : 0;

    setPdfNavigationList(navigationList);
    setCurrentPdfIndex(Math.max(0, startingIndex));
    setShowPDFViewer(true);
  };

  const handlePreviousPdf = () => {
    if (currentPdfIndex > 0) {
      setCurrentPdfIndex(currentPdfIndex - 1);
    }
  };

  const handleNextPdf = () => {
    if (currentPdfIndex < pdfNavigationList.length - 1) {
      setCurrentPdfIndex(currentPdfIndex + 1);
    }
  };

  const getCurrentPdfData = (): PDFNavigationItem | null => {
    return pdfNavigationList[currentPdfIndex] || null;
  };

  const handlePdfChatSend = async () => {
    if (!pdfChatInput.trim()) return;

    const currentPdfData = getCurrentPdfData();
    setPdfChatMessages(prev => [...prev, { type: 'user', content: pdfChatInput }]);
    setPdfChatLoading(true);
    const pdfId = currentPdfData?.file?.pdf_id || null;

    try {
      const response = await fetch(
        `${CHATBOT_ENDPOINT}?query=${encodeURIComponent(pdfChatInput)}${pdfId ? `&pdf_id=${pdfId}` : ''}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new FetchError(`HTTP error! status: ${response.status}`, response, errorData);
      }

      const responseData = await response.json();
      setPdfChatMessages(prev => [
        ...prev,
        { type: 'bot', content: responseData.response || "No answer found for this PDF." }
      ]);
    } catch (error) {
      console.error('PDF chat error:', error);
      setPdfChatMessages(prev => [
        ...prev,
        { type: 'bot', content: "Sorry, there was an error processing your request." }
      ]);
    } finally {
      setPdfChatInput('');
      setPdfChatLoading(false);
    }
  };

  const PDFReferenceCard = ({ pdfRefs }: { pdfRefs?: Message['documents'] }) => {
    if (!pdfRefs || pdfRefs.length === 0) return null;

    return (
      <div className="mt-2 p-1.5 flex flex-row flex-wrap gap-2 overflow-x-auto">
        {pdfRefs.map((doc, idx) => {
          const highlightsForDoc = (doc.chunk || []).reduce((acc: HighlightItem[], chunkObj) => {
            const existing = acc.find(h => h.page === chunkObj.page_number);
            if (existing) {
              existing.keywords.push(chunkObj.chunk);
            } else {
              acc.push({ page: chunkObj.page_number, keywords: [chunkObj.chunk] });
            }
            return acc;
          }, [] as HighlightItem[]);

          return (
            <div
              key={`${doc.pdf_id}-${idx}`}
              className="flex items-center gap-1.5 min-w-[150px] border border-gray-200 rounded p-1 cursor-pointer hover:bg-gray-100"
              onClick={async () => {
                try {
                  await handleViewPDFReference(doc.pdf_id, highlightsForDoc, doc.total_pages);
                } catch (error) {
                  console.error('Error fetching PDF for viewing:', error);
                }
              }}
            >
              <img src="/assets/pdf.png" alt="PDF Icon" className="w-4 h-4 object-contain" />
              <div>
                <div className="font-medium text-[10px] text-gray-800 truncate max-w-[120px]">
                  PDF #{doc.pdf_id} (Page {doc.chunk[0]?.page_number || 'N/A'})
                </div>
                <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                  {doc.chunk[0]?.chunk || 'Summary unavailable'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const closePdfViewerModal = () => {
    setShowPDFViewer(false);

    // Clean up blob URLs
    pdfNavigationList.forEach(item => {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });

    setPdfNavigationList([]);
    setCurrentPdfIndex(0);
  };

  const currentPdfData = getCurrentPdfData();

  return (
    <>
      <div className="flex h-screen bg-white">
        {/* {!showPDFViewer && <Sidebar onShowDashboard={() => setShowDashboard(true)} />} Sidebar component removed */}

        {/* The main content area will now take the full width if Sidebar is removed */}
        <div className={`flex-1 flex flex-col relative h-full ${showPDFViewer ? 'w-full' : ''}`}>
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className="flex flex-1 h-full overflow-hidden">
              {/* md:ml-7 removed as Sidebar is gone */}
              <div className={`flex flex-col h-full relative w-full md:flex-1 ${!showPDFViewer ? '' : ''}`}>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick={true}
                  closeButton={true}
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                  style={{ zIndex: 9999 }}
                  toastStyle={{
                    minWidth: '200px',
                    maxWidth: '300px',
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    marginTop: '0.5rem',
                    marginRight: '0.5rem'
                  }}
                />

                {!rightPanelOpen && !showPDFViewer && (
                  <button
                    onClick={() => setRightPanelOpen(true)}
                    className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#172A2F] text-white px-2 py-4 rounded-l-lg shadow-lg flex items-center gap-1"
                    aria-label="Open right panel"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <div className="flex-1 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-20 md:pb-32">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gray-50 rounded-full">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-black font-medium text-base md:text-lg">How may I assist you with your documents today?</p>
                          <p className="text-gray-500 text-sm md:text-base">Upload PDFs and ask questions about their content.</p>
                          {/* Button to open dashboard if needed, or integrate into another UI element */}
                          {/* <button onClick={() => setShowDashboard(true)}>Show Dashboard</button> */}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full md:w-[70%] md:max-w-4xl md:mx-auto mt-10 md:mt-12 space-y-4">
                        {messages.map((message, index) => (
                          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-xl p-2 md:p-3 shadow-md ${
                                message.type === 'user'
                                  ? 'bg-[#172A2F] text-white'
                                  : 'bg-white text-gray-800 border border-gray-200'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                              {message.documents && <PDFReferenceCard pdfRefs={message.documents} />}
                            </div>
                          </div>
                        ))}
                        {loading && messages.length > 0 && messages[messages.length - 1].type === 'user' && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-xl p-2 md:p-3 shadow-md bg-white text-gray-800 border border-gray-200 flex items-center gap-2">
                              <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-gray-500">Bot is thinking...</span>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {!showPDFViewer && (
                    <div className="absolute bottom-2 md:bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[70%] md:max-w-4xl md:mx-auto flex flex-col gap-0.5 md:gap-2 border border-gray-200 rounded-xl shadow-xl bg-white">
                      <div className="px-1 pt-0.5 md:pt-2 w-full min-h-[28px] md:min-h-[48px]">
                        <textarea
                          ref={textAreaRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Ask anything about your documents..."
                          className="w-full resize-none py-0.5 px-1.5 md:py-2 md:px-3 min-h-[20px] md:min-h-[40px] max-h-[60px] md:max-h-[100px] text-xs md:text-base text-gray-800 focus:outline-none focus:ring-0 rounded"
                          style={{ height: 'auto' }}
                          rows={1}
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-center justify-between w-full px-1.5 py-0.5 md:px-3 md:py-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const selectedInputFiles = Array.from(e.target.files || []);
                            setFilesForUpload(selectedInputFiles);
                            handlePdfUpload(selectedInputFiles);
                          }}
                          accept=".pdf"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          className="p-1.5 md:p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-black"
                          title="Upload PDF(s)"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                        >
                          <Plus size={16} className="md:w-5 md:h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
                            disabled
                            title="Voice input (coming soon)"
                          >
                            <Mic size={16} className="text-gray-400 md:w-5 md:h-5" />
                          </button>
                          <button
                            type="submit"
                            onClick={handleSend}
                            disabled={!inputMessage.trim() || loading || selectedFiles.length === 0}
                            className="p-1.5 md:p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50"
                            aria-label="Send message"
                          >
                            {loading && messages.length > 0 && messages[messages.length - 1].type === 'user' ? (
                              <div className="h-2.5 w-2.5 md:h-3 md:w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Send size={16} className="md:w-[18px] md:h-[18px]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!showPDFViewer && (
                <div
                  className={`fixed md:static top-0 right-0 h-full w-full sm:w-3/4 md:w-[400px] bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-40
                    ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:flex`}
                >
                  {rightPanelOpen && (
                    <button
                      onClick={() => setRightPanelOpen(false)}
                      className="md:hidden absolute top-1/2 -translate-y-1/2 left-1 p-2 bg-[#172A2F] text-white rounded-full shadow-lg z-50 transform -translate-x-full"
                      aria-label="Close right panel"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                  <RightPanel
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    setMessages={setMessages}
                    showToast={showToast}
                    onViewPDF={handleViewPDF}
                    onViewMultiplePDFs={handleViewMultiplePDFs}
                  />
                </div>
              )}

              <PdfPopup
                show={showPDFViewer}
                onClose={closePdfViewerModal}
                currentPdfData={currentPdfData}
                pdfNavigationList={pdfNavigationList}
                currentPdfIndex={currentPdfIndex}
                handlePreviousPdf={handlePreviousPdf}
                handleNextPdf={handleNextPdf}
                pdfChatMessages={pdfChatMessages}
                pdfChatInput={pdfChatInput}
                setPdfChatInput={setPdfChatInput}
                handlePdfChatSend={handlePdfChatSend}
                pdfChatLoading={pdfChatLoading}
                referencePdfs={(referencePdfs ?? []).filter(doc =>
                  doc.pdf_id !== currentPdfData?.file?.pdf_id &&
                  doc.pdf_id !== parseInt(currentPdfData?.title?.replace(/\D/g, '') || '0')
                )}
                handleViewPDFReference={handleViewPDFReference}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overlay */}
      {showDashboard && (
        <DocDashboard
          // isOpen={showDashboard}
          // onClose={() => setShowDashboard(false)}
        />
      )}
    </>
  );
}