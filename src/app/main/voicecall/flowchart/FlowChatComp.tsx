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
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
        <div className="flex-grow bg-gray-50 shadow-inner rounded-t-lg p-4 space-y-4 overflow-y-auto mb-4">
          {Object.entries(callData.conversation).map(([key, turn]) => (
            <React.Fragment key={key}>
              {turn.agent && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ml-auto">
                    <div className="flex items-center justify-end space-x-2 mb-1">  
                      <span className="text-xs font-medium text-indigo-600">NepVoice AI</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(turn.agent.timestamp)}</span>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl rounded-tr-none shadow-sm border border-indigo-100">
                      <p className="text-sm text-gray-800 leading-relaxed">{turn.agent.speaks}</p>
                    </div>
                  </div>
                </div>
              )}
              {turn.customer && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%] mr-auto">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-emerald-600">You</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(turn.customer.timestamp)}</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl rounded-tl-none shadow-sm border border-emerald-100">
                      <p className="text-sm text-gray-800 leading-relaxed">{turn.customer.speaks}</p>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200">
          <input
            type="text"
            placeholder="Chat with our system to build your flowchart..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow duration-200 ease-in-out"
          />
        </div>
    </div>
  );
};

export default FlowChatComp;