"use client";

import React, { useState} from 'react';
import { Phone, Clock, Activity,LayoutDashboard} from 'lucide-react';
import CallDetails from "./calldetails";
import FlowchartEditorModal from './flowchart/FlowChart';
import 'reactflow/dist/style.css';
import { CallLog } from "./types";

const mockCallLogs: CallLog[] = [
  { id: 1, name: "John Doe", number: "+977 9841234567", bank: "Global IME", schedule: "5 min", status: "Completed", timestamp: "2024-03-20 14:30", duration: "3:45", details: { callType: "Outbound", agent: "AI Assistant", transcript: "Hello, this is a test call from Global IME. How can I assist you today?", notes: "Customer was interested in our new savings account.", recordingUrl: "https://example.com/recording1.mp3"} },
  { id: 2, name: "Jane Smith", number: "+977 9851234567", bank: "Nabil Bank", schedule: "10 min", status: "In Progress", timestamp: "2024-03-20 14:35", duration: "2:15", details: { callType: "Outbound", agent: "AI Assistant", transcript: "Currently in progress...", notes: "Call scheduled for account verification", recordingUrl: "https://example.com/recording2.mp3"} },
  { id: 3, name: "Mike Johnson", number: "+977 9861234567", bank: "WorldLink", schedule: "15 min", status: "Scheduled", timestamp: "2024-03-20 14:40", duration: "-", details: { callType: "Outbound", agent: "AI Assistant", transcript: "Not started yet", notes: "Scheduled for service inquiry", recordingUrl: null} },
  { id: 4, name: "Sarah Wilson", number: "+977 9871234567", bank: "Shikhar Insurance", schedule: "20 min", status: "Failed", timestamp: "2024-03-20 14:25", duration: "0:30", details: { callType: "Outbound", agent: "AI Assistant", transcript: "Call failed to connect", notes: "Number busy, will retry later", recordingUrl: null} }
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  bgColorClass?: string;
  textColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, bgColorClass = 'bg-blue-500', textColorClass = 'text-white' }) => (
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

export default function AudioDashboard() {
  const [showCallDetailsModal, setShowCallDetailsModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);

  const handleOpenCallDetails = (log: CallLog) => {
    setSelectedCall(log);
    setShowCallDetailsModal(true);
  };

  const handleCloseCallDetails = () => {
    setShowCallDetailsModal(false);
    setSelectedCall(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 font-custom">
          <main className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Audio Dashboard</h1>
              <button
                onClick={() => {
                  setShowFlowchartModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transition-colors duration-300"
              >
                <LayoutDashboard size={20} />
                <span>Flowchart Editor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Calls" value="2,847" icon={Phone} bgColorClass="bg-blue-100" textColorClass="text-blue-600" />
              <StatCard title="Scheduled Calls" value="156" icon={Clock} bgColorClass="bg-yellow-100" textColorClass="text-yellow-600" />
              <StatCard title="Success Rate" value="98.5%" icon={Activity} bgColorClass="bg-green-100" textColorClass="text-green-600" />
              <StatCard title="Avg. Duration" value="3.5 min" icon={Clock} bgColorClass="bg-purple-100" textColorClass="text-purple-600" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Recent Call Logs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCallLogs.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg">Start making calls with NepVoice</td></tr>
                    ) : (
                      mockCallLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.bank}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.schedule}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Completed' ? 'bg-green-100 text-green-800' : log.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : log.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleOpenCallDetails(log)} className="text-[#0088cc] hover:text-[#0077b3] transition-colors px-3 py-1 rounded-md hover:bg-blue-50">Details</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Showing <span className="font-medium">{mockCallLogs.length}</span> of <span className="font-medium">2,847</span> calls</div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Previous</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showCallDetailsModal && selectedCall && (
        <CallDetails call={selectedCall} onClose={handleCloseCallDetails} />
      )}

      {showFlowchartModal && (
         <FlowchartEditorModal
            isOpen={showFlowchartModal}
            onClose={() => setShowFlowchartModal(false)}
          />
      )}
    </div>
  );
}