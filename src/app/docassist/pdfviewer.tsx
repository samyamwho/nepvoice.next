import React, { useState, useRef, useEffect, useMemo } from "react"; // Added React import
import { PDFHighlight } from "@pdf-highlight/react-pdf-highlight";

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
  totalPdfs = 1,
  onPreviousPdf,
  onNextPdf,
  pdfTitle,
}) => {
  const usedHighlights = useMemo(() => highlights ?? [], [highlights]);

  const [currentPdfUrlInternal, setCurrentPdfUrlInternal] = useState<string | null>(null);
  const [currentTotalPages, setCurrentTotalPages] = useState<number>(DEFAULT_TOTAL_PAGES);

  const [scale, setScale] = useState<number>(1);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const hasScrolledToHighlight = useRef(false);

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    if (uploadedFile?.file) {
      const fileUrl = URL.createObjectURL(uploadedFile.file);
      setCurrentPdfUrlInternal(fileUrl);
      objectUrlToRevoke = fileUrl;
      setCurrentTotalPages(totalPagesProp ?? DEFAULT_TOTAL_PAGES); // Use totalPagesProp if available
      hasScrolledToHighlight.current = false;
    } else if (externalPdfUrlProp) {
      setCurrentPdfUrlInternal(externalPdfUrlProp);
      setCurrentTotalPages(totalPagesProp ?? DEFAULT_TOTAL_PAGES); // Use totalPagesProp if available
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

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure runs only on client

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect.width > 0) {
        const containerWidth = entries[0].contentRect.width;
        // Adjust scale calculation for better fit, ensuring it doesn't get too small or too large
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
  }, []); // Empty dependency array, runs once on mount

  const scrollToHighlight = (pageNumber: number) => {
    setActiveHighlight(pageNumber);

    const pageRef = pageRefs.current[pageNumber];
    if (pageRef && pdfContainerRef.current) {
      const rect = pageRef.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      // Check if page is not fully visible
      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom + 5) { // Added a small buffer
        pageRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
      }, 500); // Delay to allow rendering

      return () => clearTimeout(timer);
    }
  }, [currentPdfUrlInternal, pagesWithHighlights, scrollToHighlight]); // Added scrollToHighlight to deps

  useEffect(() => {
    setActiveHighlight(null);
    hasScrolledToHighlight.current = false;
    pageRefs.current = {}; // Reset page refs
  }, [currentPdfIndex, currentPdfUrlInternal]); // Also reset on currentPdfUrlInternal change

  if (!currentPdfUrlInternal) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full">
        <p className="text-gray-500">No PDF selected or URL provided.</p>
        <p className="text-xs mt-2 text-gray-400">(Ensure pdf.worker.js is in your public folder if issues persist)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-black bg-gray-50"> {/* Added bg-gray-50 to parent */}
      {/* Header Section - Removed for cleaner integration into PdfPopup */}
      <div
        ref={containerRef}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div
          ref={pdfContainerRef}
          className="relative bg-gray-200 rounded-lg overflow-auto flex-grow custom-scrollbar p-2" // Added padding and changed bg
        >
          {Array.from({ length: currentTotalPages }).map((_, idx) => {
            const page = idx + 1;
            const uniqueKeywordsForPage = groupedHighlights[page] || [];

            return (
              <div
                key={`pdf-page-wrapper-${page}-${currentPdfUrlInternal}`} // Added currentPdfUrlInternal to key for re-render on PDF change
                className={`min-w-full relative my-2 shadow-lg ${ // Added margin and shadow
                  activeHighlight === page ? "ring-4 ring-blue-500 rounded-md" : "" // Ring on highlight
                }`}
                ref={el => { pageRefs.current[page] = el; }}
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

        {/* Bottom controls bar */}
        {currentPdfUrlInternal && (
          <div className="w-full bg-white flex items-center justify-between py-2 px-4 gap-3 border-t border-gray-200 shadow- ऊपर">
            {/* Highlights navigation */}
            {pagesWithHighlights.length > 0 && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Highlights:</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto" style={{ maxWidth: 'calc(100% - 200px)'}}> {/* Limit width */}
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
             {pagesWithHighlights.length === 0 && <div className="flex-1"></div>} {/* Spacer if no highlights */}


            {/* Zoom controls */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-gray-300 rounded-full transition-colors text-gray-600 hover:text-black"
                title="Zoom out"
                disabled={scale <= 0.5}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xs font-medium text-gray-700 w-10 text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-gray-300 rounded-full transition-colors text-gray-600 hover:text-black"
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
      </div>
    </div>
  );
};

export default PDFView;

/* 
  Custom creative scrollbar for PDF viewer.
  For Next.js, it's recommended to move these styles to a global CSS file 
  (e.g., styles/globals.css) and import it in your _app.tsx file.
*/
// This effect will run once on the client side.
if (typeof window !== 'undefined') {
  const styleId = 'custom-scrollbar-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1; /* Tailwind gray-300 */
      border-radius: 8px;
      border: 2px solid transparent; /* Creates padding around thumb */
      background-clip: padding-box;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8; /* Tailwind gray-400 */
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9; /* Tailwind gray-100 */
      border-radius: 8px;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9; /* thumb track */
    }
    `;
    document.head.appendChild(style);
  }
}