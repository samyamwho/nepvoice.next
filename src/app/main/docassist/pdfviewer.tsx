'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';

// Dynamically import PDFHighlight to avoid SSR issues
const PDFHighlight = dynamic(
  () => import("@pdf-highlight/react-pdf-highlight").then(mod => mod.PDFHighlight),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading...</div>
  }
);

export type HighlightItem = {
  page: number;
  keywords: string[];
};

const DEFAULT_TOTAL_PAGES = 25;

interface UploadedFile {
  file: File;
  pdf_id?: number;
}

interface PDFViewProps {
  pdfUrl?: string | null;
  highlights?: HighlightItem[];
  totalPages?: number;
  uploadedFile?: UploadedFile | null;
  currentPdfIndex?: number;
  totalPdfs?: number;
  onPreviousPdf?: () => void;
  onNextPdf?: () => void;
  pdfTitle?: string;
}

const PDFView: React.FC<PDFViewProps> = ({
  pdfUrl: externalPdfUrlProp = null,
  highlights,
  totalPages: totalPagesProp,
  uploadedFile,
  currentPdfIndex = 0,
}) => {
  const usedHighlights = useMemo(() => highlights ?? [], [highlights]);

  const [currentPdfUrlInternal, setCurrentPdfUrlInternal] = useState<string | null>(null);
  const [currentTotalPages, setCurrentTotalPages] = useState<number>(DEFAULT_TOTAL_PAGES);
  const [scale, setScale] = useState<number>(1);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const hasScrolledToHighlight = useRef(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  }, []);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    if (uploadedFile?.file) {
      const fileUrl = URL.createObjectURL(uploadedFile.file);
      setCurrentPdfUrlInternal(fileUrl);
      objectUrlToRevoke = fileUrl;
      setCurrentTotalPages(totalPagesProp ?? DEFAULT_TOTAL_PAGES);
      hasScrolledToHighlight.current = false;
    } else if (externalPdfUrlProp) {
      setCurrentPdfUrlInternal(externalPdfUrlProp);
      setCurrentTotalPages(totalPagesProp ?? DEFAULT_TOTAL_PAGES);
      hasScrolledToHighlight.current = false;
    } else {
      setCurrentPdfUrlInternal(null);
    }

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [uploadedFile, externalPdfUrlProp, totalPagesProp]);

  const groupedHighlights: Record<number, string[]> = useMemo(() => 
    usedHighlights.reduce(
      (acc, item) => {
        if (!acc[item.page]) acc[item.page] = [];
        acc[item.page].push(...item.keywords);
        return acc;
      },
      {} as Record<number, string[]>
    ), [usedHighlights]);

  const pagesWithHighlights = useMemo(() => 
    Object.keys(groupedHighlights).map(Number).sort((a, b) => a - b),
    [groupedHighlights]
  );

  // Responsive scale adjustment
  useEffect(() => {
    if (!isClient) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect.width > 0) {
        const containerWidth = entries[0].contentRect.width;
        const calculatedScale = Math.min(Math.max(containerWidth / 800 * 0.95, 0.5), 1.5); 
        setScale(calculatedScale);
      }
    });

    const currentRef = pdfContainerRef.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      resizeObserver.disconnect();
    };
  }, [isClient]);

  const scrollToHighlight = useCallback((pageNumber: number) => {
    setActiveHighlight(pageNumber);

    const pageRef = pageRefs.current[pageNumber];
    if (pageRef && pdfContainerRef.current) {
      const rect = pageRef.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom + 5) {
        pageRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  useEffect(() => {
    if (
      currentPdfUrlInternal &&
      pagesWithHighlights.length > 0 &&
      !hasScrolledToHighlight.current
    ) {
      const timer = setTimeout(() => {
        if (pageRefs.current[pagesWithHighlights[0]]) {
          scrollToHighlight(pagesWithHighlights[0]);
          hasScrolledToHighlight.current = true;
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPdfUrlInternal, pagesWithHighlights, scrollToHighlight]);

  useEffect(() => {
    setActiveHighlight(null);
    hasScrolledToHighlight.current = false;
    pageRefs.current = {};
  }, [currentPdfIndex, currentPdfUrlInternal]);

  // Don't render until we're on the client
  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full">
        <p className="text-gray-500">Loading PDF viewer...</p>
      </div>
    );
  }

  if (!currentPdfUrlInternal) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full">
        <p className="text-gray-500">No PDF selected or URL provided.</p>
        <p className="text-xs mt-2 text-gray-400">
          (Ensure pdf.worker.js is in your public folder if issues persist)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-black bg-gray-50">
      <div ref={containerRef} className="flex flex-col flex-1 overflow-hidden">
        <div
          ref={pdfContainerRef}
          className="relative bg-gray-200 rounded-lg overflow-auto flex-grow pdf-scrollbar p-2"
        >
          {Array.from({ length: currentTotalPages }).map((_, idx) => {
            const page = idx + 1;
            const uniqueKeywordsForPage = groupedHighlights[page] || [];

            return (
              <div
                key={`pdf-page-wrapper-${page}-${currentPdfUrlInternal}`}
                className={`min-w-full relative my-2 shadow-lg ${
                  activeHighlight === page ? "ring-4 ring-blue-500 rounded-md" : ""
                }`}
                ref={(el) => { pageRefs.current[page] = el; }}
                id={`pdf-page-${page}`}
              >
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs z-10">
                  Page {page} / {currentTotalPages}
                </div>
                <PDFHighlight
                  url={currentPdfUrlInternal}
                  page={page}
                  keywords={uniqueKeywordsForPage}
                  scale={scale}
                />
              </div>
            );
          })}
        </div>
      </div>
{/* Bottom controls bar */}
{currentPdfUrlInternal && (
  <div className="w-full bg-white flex items-center justify-between py-2 px-4 gap-3 border-t border-gray-200">
    {/* Highlights navigation */}
    {pagesWithHighlights.length > 0 && (
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium text-gray-700">Highlights:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto" style={{ maxWidth: 'calc(100% - 200px)'}}>
          {pagesWithHighlights.map((page) => (
            <button
              key={`highlight-nav-${page}`}
              onClick={() => scrollToHighlight(page)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                activeHighlight === page
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
              }`}
            >
              P{page}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Clickable spacer when no highlights */}
    {pagesWithHighlights.length === 0 && (
      <button
        onClick={() => {
          console.log("No highlights available area clicked. Implement an action here.");
          // For example, you could show a modal, an alert, or navigate to a help section.
          // alert("There are no highlights yet. Select text to create one, or click here to learn more.");
        }}
        className="flex-1 text-left px-1 py-1 text-xs text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        aria-label="Action or information when no highlights are present"
        title="No highlights available. Click for more info." // Optional: adds a native tooltip
      >
        {/* You can leave this empty for a purely visual spacer that's clickable, */}
        {/* or add subtle text.   ensures it has some content for layout. */}
        {/* Example text: "No highlights yet." */}
         
      </button>
    )}

    {/* Zoom controls */}
    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 ml-auto"> {/* Added ml-auto here to ensure zoom is pushed right if highlights are present */}
      <button
        onClick={handleZoomOut}
        className="p-1.5 hover:bg-gray-300 rounded-full transition-colors text-gray-600 hover:text-black disabled:opacity-50"
        title="Zoom out"
        disabled={scale <= 0.5}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <span className="text-xs font-medium text-gray-700 w-10 text-center">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={handleZoomIn}
        className="p-1.5 hover:bg-gray-300 rounded-full transition-colors text-gray-600 hover:text-black disabled:opacity-50"
        title="Zoom in"
        disabled={scale >= 2.0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
)}

      <style jsx>{`
        .pdf-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .pdf-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .pdf-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .pdf-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .pdf-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default PDFView;