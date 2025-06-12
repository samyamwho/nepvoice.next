'use client';

import React from 'react';
import { Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { HighlightItem } from './pdfviewer';

// Dynamically import PDFView to avoid SSR issues
const PDFView = dynamic(() => import('./pdfviewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading PDF viewer...</div>
});

interface Message {
  pdf_id: number;
  total_pages: number;
  chunk: Array<{
    chunk_number: number;
    chunk: string;
    page_number: number;
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

interface PdfPopupProps {
  show: boolean;
  onClose: () => void;
  currentPdfData: PDFNavigationItem | null;
  pdfNavigationList: PDFNavigationItem[];
  currentPdfIndex: number;
  handlePreviousPdf: () => void;
  handleNextPdf: () => void;
  pdfChatMessages: { type: 'user' | 'bot'; content: string }[];
  pdfChatInput: string;
  setPdfChatInput: (val: string) => void;
  handlePdfChatSend: () => void;
  pdfChatLoading: boolean;
  referencePdfs: Message[];
  handleViewPDFReference: (pdfId: number, highlights: HighlightItem[], totalPages: number) => void;
}

const PDFReferenceCard = ({ 
  pdfRefs, 
  handleViewPDFReference 
}: { 
  pdfRefs?: Message[]; 
  handleViewPDFReference: PdfPopupProps['handleViewPDFReference'] 
}) => {
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
            className="flex items-center gap-1.5 min-w-[150px] border border-gray-200 rounded p-1 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={async () => {
              try {
                await handleViewPDFReference(doc.pdf_id, highlightsForDoc, doc.total_pages);
              } catch (error) {
                console.error("Error in PDFReferenceCard onClick:", error);
              }
            }}
          >
            {/* PDF Icon - consider using Lucide React icon instead for consistency */}
            <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
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

const PdfPopup: React.FC<PdfPopupProps> = ({
  show,
  onClose,
  currentPdfData,
  pdfNavigationList,
  currentPdfIndex,
  handlePreviousPdf,
  handleNextPdf,
  pdfChatMessages,
  pdfChatInput,
  setPdfChatInput,
  handlePdfChatSend,
  pdfChatLoading,
  referencePdfs,
  handleViewPDFReference,
}) => {
  if (!show || !currentPdfData) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl relative w-[80%] h-[80vh] flex">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Close PDF viewer"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Left Panel - PDF Viewer (60%) */}
        <div className="w-[60%] flex flex-col border-r border-gray-200">
          <div className="flex-grow shadow overflow-hidden">
            <PDFView
              uploadedFile={currentPdfData.file}
              pdfUrl={currentPdfData.url}
              highlights={currentPdfData.highlights}
              totalPages={currentPdfData.totalPages}
              currentPdfIndex={currentPdfIndex}
              totalPdfs={pdfNavigationList.length}
              onPreviousPdf={pdfNavigationList.length > 1 ? handlePreviousPdf : undefined}
              onNextPdf={pdfNavigationList.length > 1 ? handleNextPdf : undefined}
              pdfTitle={currentPdfData.title}
            />
          </div>
        </div>

        {/* Right Panel - Details (40%) */}
        <div className="w-[40%] flex flex-col h-full p-4">
          {/* Top 40%: Other Reference PDFs */}
          <div className="basis-2/5 min-h-[120px] max-h-[40%] overflow-y-auto border-b border-gray-200 mb-4 flex flex-col justify-start rounded-xl bg-white shadow-sm p-4">
            <h3 className="text-base font-semibold mb-2 text-gray-700">Other Reference PDFs</h3>
            <PDFReferenceCard pdfRefs={referencePdfs} handleViewPDFReference={handleViewPDFReference} />
          </div>

          {/* Bottom 60%: PDF Chatbot Area */}
          <div className="flex flex-col h-full bg-gray-50 shadow-inner rounded-xl p-4 mt-2" style={{ minHeight: '60%', maxHeight: '80%' }}>
            <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
              {pdfChatMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
                  How can I help you with this PDF?
                </div>
              ) : (
                pdfChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] rounded-xl p-2 text-sm shadow ${
                        msg.type === 'user' 
                          ? 'bg-[#172A2F] text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {pdfChatLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white text-gray-800 shadow-sm rounded-xl p-2 flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-3 py-2 flex items-center gap-2 rounded-lg bg-white border border-gray-200 mt-2">
              <input
                type="text"
                value={pdfChatInput}
                onChange={(e) => setPdfChatInput(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePdfChatSend();
                  }
                }}
                className="flex-1 text-black px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#588085] rounded-md"
                placeholder="Type your message..."
                disabled={pdfChatLoading}
              />
              <button
                onClick={handlePdfChatSend}
                disabled={!pdfChatInput.trim() || pdfChatLoading}
                className="bg-[#172A2F] text-white rounded-lg p-2 hover:bg-[#174627] flex items-center justify-center disabled:opacity-50 transition-all"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPopup;