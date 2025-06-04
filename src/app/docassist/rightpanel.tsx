import React from 'react';
import { FileText, Eye, Trash2, LayoutDashboard, Settings, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/router'; // Changed from react-router-dom

interface UploadedFile {
  file: File;
  pdf_id?: number;
}

interface RightPanelProps {
  activeTab: 'settings' | 'files';
  setActiveTab: React.Dispatch<React.SetStateAction<'settings' | 'files'>>;
  selectedFiles: UploadedFile[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  setMessages: React.Dispatch<React.SetStateAction<Array<{ type: 'user' | 'bot'; content: string; documents?: any }>>>;
  onViewPDF: (file: UploadedFile) => void;
}

export default function RightPanel({
  activeTab,
  setActiveTab,
  selectedFiles,
  setSelectedFiles,
  showToast,
  setMessages,
  onViewPDF,
}: RightPanelProps) {
  const router = useRouter(); // Changed from useNavigate

  const handleDeleteFile = (fileToDelete: UploadedFile) => {
    setSelectedFiles(prev => 
      prev.filter(item => 
        (item.pdf_id ?? item.file.name) !== (fileToDelete.pdf_id ?? fileToDelete.file.name)
      )
    );
    showToast('PDF removed successfully', 'success');
  };

  const handleNavigateToDashboard = () => {
    router.push('/docdashboard'); // Changed from navigate
  };

  return (
    <div className="w-full md:w-[400px] bg-white border-l border-gray-200 p-2 md:p-6 flex flex-col h-full items-stretch">
      {/* Enhanced Tab Navigation */}
      <div className="w-full flex flex-row items-center justify-between border-b border-gray-200 pb-2 md:pb-3 mb-2 gap-2">
        <div className="flex items-center w-full gap-2 min-w-0">
          <button
            className={`flex-1 min-w-0 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium relative transition-all duration-200 flex items-center justify-center gap-2 ${ // Adjusted text size and justify
              activeTab === 'settings'
                ? 'text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            className={`flex-1 min-w-0 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium relative transition-all duration-200 flex items-center justify-center gap-2 ${ // Adjusted text size and justify
              activeTab === 'files'
                ? 'text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('files')}
          >
            <FolderOpen className="h-4 w-4" /> {/* Changed icon to FolderOpen and size */}
            Files
          </button>
        </div>
        <button
          className="flex-shrink-0 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-medium relative bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg" // Adjusted padding and text size
          onClick={handleNavigateToDashboard}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
      </div>

      {/* Enhanced Tab Content */}
      <div className="w-full mt-0 overflow-y-auto flex flex-col items-stretch" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {activeTab === 'settings' ? (
          <div className="w-full flex flex-col space-y-4 items-stretch">
            {/* PDF Management Section (Moved from 'files' tab for this example, adjust if needed) */}
            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mt-2 w-full">
              <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                PDF Management
              </h3>
              {selectedFiles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium">No PDFs uploaded</p>
                  <p className="text-gray-400 text-xs mt-2">Upload PDFs to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFiles.map((uploadedFile) => (
                    <div key={uploadedFile.pdf_id || uploadedFile.file.name} 
                         className="w-full bg-white rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[120px] md:max-w-[150px] font-medium">
                            {uploadedFile.file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewPDF(uploadedFile)}
                            className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                            title="View PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(uploadedFile)}
                            className="bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                            title="Remove PDF"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Preferences Section */}
            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-full">
              <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Chat Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium text-sm">Auto-scroll to new messages</span>
                    <span className="text-gray-500 text-xs">Automatically scroll to latest messages</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
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
                      defaultChecked // Consider if this should be `checked` and controlled by state
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Chat Actions Section */}
            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-full mb-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Chat Actions
              </h3>
              <button
                onClick={() => {
                  setMessages([]);
                  showToast('Chat history cleared', 'success');
                }}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg px-4 py-2 md:py-3 shadow-lg hover:from-gray-800 hover:to-black transition-all duration-300 text-sm font-medium"
              >
                Clear Chat History
              </button>
            </div>
          </div>
        ) : activeTab === 'files' ? (
          <div className="w-full flex flex-col space-y-4 items-stretch">
            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mt-2 w-full mb-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-gray-600" />
                Uploaded PDFs
              </h3>
              {selectedFiles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium">No PDFs uploaded yet</p>
                  <p className="text-gray-400 text-xs mt-2">Upload PDFs to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFiles.map((uploadedFile) => (
                    <div key={uploadedFile.pdf_id || uploadedFile.file.name} 
                         className="w-full bg-white rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[120px] md:max-w-[150px] font-medium">
                            {uploadedFile.file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewPDF(uploadedFile)}
                            className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                            title="View PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(uploadedFile)}
                            className="bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700 transition-all duration-200 min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center hover:shadow-md"
                            title="Remove PDF"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}