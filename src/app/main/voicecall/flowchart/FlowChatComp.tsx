import React from 'react';

interface Message {
  speaks: string;
  timestamp: string;
}

interface Turn {
  agent?: Message;
  customer?: Message;
}

interface Conversation {
  [turnId: string]: Turn;
}

const mockConversationData: Conversation = {
  turn1: { agent: { speaks: "Hello! This is NepVoice. How can I assist you with your flowchart design today?", timestamp: "2024-03-21T10:00:00Z" } },
  turn2: { customer: { speaks: "I need to add a decision node after my 'Process Payment' step.", timestamp: "2024-03-21T10:00:35Z" } },
  turn3: { agent: { speaks: "Certainly. What are the conditions for this decision? For example, 'Payment Successful' and 'Payment Failed'?", timestamp: "2024-03-21T10:01:10Z" } },
  turn4: { customer: { speaks: "Exactly! And if successful, it should go to 'Send Confirmation', otherwise to 'Retry Payment'.", timestamp: "2024-03-21T10:01:45Z" } },
  turn5: { agent: { speaks: "Got it. I'll add a decision node with those branches and connect them accordingly. Anything else?", timestamp: "2024-03-21T10:02:20Z" } },
  turn6: { customer: { speaks: "No, that's perfect for now. Thanks!", timestamp: "2024-03-21T10:02:50Z" } },
  turn7: { agent: { speaks: "You're welcome! Let me know if you need further adjustments.", timestamp: "2024-03-21T10:03:15Z" } }
};

const formatTimestamp = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch{
    return '';
  }
};

const FlowChatComp: React.FC = () => {
  const callData = { conversation: mockConversationData };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow relative">
      <div className="flex-grow bg-gray-50 shadow-inner rounded-t-lg p-4 space-y-6 overflow-y-auto mb-2">
        {Object.entries(callData.conversation).map(([key, turn]) => (
          <React.Fragment key={key}>
            {turn.agent && (
              <div className="flex justify-end group">
                <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ml-auto transition-all">
                  <div className="flex items-center justify-end space-x-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-700">NepVoice AI</span>
                    <span className="text-xs text-gray-400">{formatTimestamp(turn.agent.timestamp)}</span>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-2xl rounded-tr-none shadow-sm border border-indigo-100 group-hover:bg-indigo-100 transition">
                    <p className="text-sm text-gray-800 leading-relaxed">{turn.agent.speaks}</p>
                  </div>
                </div>
              </div>
            )}
            {turn.customer && (
              <div className="flex justify-start group">
                <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%] mr-auto transition-all">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-emerald-700">You</span>
                    <span className="text-xs text-gray-400">{formatTimestamp(turn.customer.timestamp)}</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl rounded-tl-none shadow-sm border border-emerald-100 group-hover:bg-emerald-100 transition">
                    <p className="text-sm text-gray-800 leading-relaxed">{turn.customer.speaks}</p>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="sticky bottom-0 bg-transparent rounded-b-lg shadow-lg p-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Chat with our system to build your flowchart..."
          className="flex-1 p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow duration-200 ease-in-out outline-none"
        />
        <button
          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition text-white shadow"
          aria-label="Send"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FlowChatComp;