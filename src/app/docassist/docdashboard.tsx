import { useState } from 'react';
import { ArrowLeft, BarChart2, Users, FileText, AlertTriangle, Settings, CreditCard, DollarSign, X } from 'lucide-react';
import Sidebar from '@/components/shared/Sidebar'; // Adjust path as per your Next.js project structure
import { useRouter } from 'next/router'; // Changed from react-router-dom
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

// Define types for Document Log entries
export interface DocumentLogEntryDetails {
  agent: string;
  content: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
}

export interface DocumentLogEntry {
  doc_id: number;
  name: string;
  timestamp: string;
  type: string;
  status: string;
  size: string;
  details?: DocumentLogEntryDetails;
}

// Mock data for document logs
const mockDocLogs: DocumentLogEntry[] = [
  {
    doc_id: 1,
    name: "Project Proposal",
    timestamp: "2024-03-20 14:30",
    type: "PDF",
    status: "Processed",
    size: "2.3 MB",
    details: {
      agent: "Doc AI Agent",
      content: "This is a sample project proposal document that has been processed by our AI system. The document contains various sections including executive summary, project scope, and timeline.",
      fileUrl: "https://example.com/doc1.pdf",
      fileSize: "2.3 MB",
      fileType: "PDF"
    }
  },
  {
    doc_id: 2,
    name: "Meeting Minutes",
    timestamp: "2024-03-21 10:15",
    type: "DOCX",
    status: "Processing",
    size: "1.5 MB",
    details: {
      agent: "Doc AI Agent",
      content: "Meeting minutes from the quarterly review session. Topics discussed include project milestones, resource allocation, and upcoming deadlines.",
      fileUrl: "https://example.com/doc2.docx",
      fileSize: "1.5 MB",
      fileType: "DOCX"
    }
  }
];

// Mock data for usage over time
const mockUsageData = [
  { date: '2024-03-17', docCount: 45, queries: 120 },
  { date: '2024-03-18', docCount: 60, queries: 150 },
  { date: '2024-03-19', docCount: 75, queries: 180 },
  { date: '2024-03-20', docCount: 50, queries: 130 },
  { date: '2024-03-21', docCount: 65, queries: 160 },
  { date: '2024-03-22', docCount: 80, queries: 200 },
  { date: '2024-03-23', docCount: 55, queries: 140 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; bgColorClass?: string; textColorClass?: string }> = ({ title, value, icon: Icon, bgColorClass = 'bg-blue-500', textColorClass = 'text-white' }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
    <div className={`p-3 ${bgColorClass} ${textColorClass} rounded-full`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function DocDashboard() {
  const router = useRouter(); // Changed from useNavigate
  const [selectedDoc, setSelectedDoc] = useState<DocumentLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');

  const handleBackToDocAssist = () => {
    router.push('/docassist'); // Changed from navigate
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'logs', label: 'Document Logs', icon: FileText },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Documents" value={mockDocLogs.length.toString()} icon={FileText} bgColorClass="bg-indigo-100" textColorClass="text-indigo-600" />
              <StatCard title="Active Users Today" value="345" icon={Users} bgColorClass="bg-green-100" textColorClass="text-green-600" />
              <StatCard title="Queries Last 24h" value="12,503" icon={BarChart2} bgColorClass="bg-yellow-100" textColorClass="text-yellow-600" />
              <StatCard title="System Alerts" value="3" icon={AlertTriangle} bgColorClass="bg-red-100" textColorClass="text-red-600" />
            </div>

            {/* Usage Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Processing Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockUsageData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('-')[2]}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Documents', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value} docs`, 'Count']} // Added type for value
                    />
                    <Area 
                      type="monotone" 
                      dataKey="docCount" 
                      stroke="#4f46e5" 
                      fillOpacity={1} 
                      fill="url(#colorDocs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );

      case 'logs':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Document Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockDocLogs.map((doc) => (
                    <tr key={doc.doc_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors px-3 py-1 rounded-md hover:bg-indigo-50"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Default Document Type</p>
                      <p className="text-sm text-gray-500">Set the default document type for new uploads</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"> {/* Added focus style */}
                      <option>PDF</option>
                      <option>DOCX</option>
                      <option>TXT</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Auto-Processing</p>
                      <p className="text-sm text-gray-500">Enable automatic document processing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 font-custom"> {/* Ensure font-custom is defined in global styles */}
          <header className="mb-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToDocAssist}
                  className="p-2 rounded-full hover:bg-gray-300 transition-colors text-gray-700 hover:text-black"
                  title="Back to Doc Assist"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Document Dashboard</h1>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Document Details Popup */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedDoc(null)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Document Details</h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" // Added some padding and hover for better UX
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{selectedDoc.name}</p> {/* Added text color for better readability */}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-800">{selectedDoc.type}</p> {/* Added text color */}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-800">{selectedDoc.status}</p> {/* Added text color */}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-medium text-gray-800">{selectedDoc.size}</p> {/* Added text color */}
                </div>
              </div>
              {selectedDoc.details && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Content Preview</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Added border for consistency */}
                    <p className="text-sm text-gray-700">{selectedDoc.details.content}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}