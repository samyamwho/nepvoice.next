import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Mic, Send } from 'lucide-react';

interface ChatbotProps {
  onClose: () => void;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [animationClass] = useState('animate-bounceInChat');

  useEffect(() => {
    const timer = setTimeout(() => {
      const textArea = document.getElementById('chat-input');
      if (textArea) {
        textArea.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = inputMessage;
      setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const services = [
    'Youtube Transcript Summarizer',
    'News Reader',
    'Text Summarizer',
    'Language Translator',
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleServiceClick = (service: string) => {
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `What help do you need with ${service}?` 
    }]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`fixed bottom-[75px] right-5 w-[500px] h-[800px] bg-white rounded-2xl flex flex-col z-[1000] transition-shadow duration-300 ${
      isClosing 
        ? 'animate-slideOutChat shadow-md' 
        : animationClass + ' shadow-xl'
    }`}>
      {/* Header */}
      <div className="bg-[#172A2F] text-white p-2.5 rounded-t-2xl flex justify-between items-center">
        <h3 className="m-0 text-base font-belleza">WiseYak.ai</h3>
        <button 
          className="bg-transparent border-none text-white text-xl cursor-pointer p-0 w-6 h-6 leading-6 text-center hover:text-[#f0f0f0] transition-colors"
          onClick={handleClose}
          aria-label="Close chatbot"
        >
          ×
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative rounded-b-2xl">
        <div className="flex-1 p-4 overflow-y-auto space-y-4 relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/bgimg.png"
              alt="Chat background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Welcome Message */}
            <div className="text-center animate-fadeIn">
              <p className="text-gray-600 mt-1">
                Do you want help with any of these services?
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-2">
              {services.map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceClick(service)}
                  className="flex items-center space-x-2 p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-left text-sm text-gray-800 hover:text-[#1E5631] transform hover:scale-[1.02] transition-transform duration-150 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span>{service}</span>
                </button>
              ))}
            </div>

            {/* Messages Container */}
            <div className={`flex-1 p-4 space-y-4 pb-24 ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <p className="text-gray-500">How may I help you today?</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    style={{ animationDelay: '100ms' }}
                  >
                    <div className={`max-w-[80%] rounded-xl p-3 ${
                      message.type === 'user' 
                        ? 'bg-[#172A2F] text-white' 
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white text-gray-800 shadow-sm rounded-xl p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] mx-auto bg-white p-3 rounded-2xl backdrop-filter backdrop-blur-lg bg-opacity-90 shadow-lg animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <textarea
                  id="chat-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#588085] max-h-20 text-sm text-black"
                  rows={1}
                />
                <button
                  type="button"
                  className="text-[#172A2F] p-2 rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-transform duration-150"
                  onClick={() => console.log('Voice input clicked')}
                  aria-label="Voice input"
                >
                  <Mic size={20} />
                </button>
                <button 
                  type="submit"
                  className="bg-[#172A2F] text-white rounded-lg p-2 hover:bg-[#174627] flex items-center justify-center transform hover:scale-105 transition-transform duration-150"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 