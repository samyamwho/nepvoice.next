'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Chatbot from '@/components/chat/Chat';
import PricingPage from '@/components/compage/PricingPage';
import AudioAIPlatform from '@/components/compage/Trial';
import FeaturedAgentsSlider from '@/components/shared/FeaturedAgent';
import TypingText from '@/components/shared/TypingText';

const Divider: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center">
    <div className="h-[2px] w-1/4 bg-gray-300"></div>
    <span className="mx-4 text-lg font-semibold text-gray-600 uppercase font-[Avenir]">{text}</span>
    <div className="h-[2px] w-1/4 bg-gray-300"></div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const servicesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showChatButtonAnimation, setShowChatButtonAnimation] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    const observer = new IntersectionObserver(
      () => {
        // No-op
      },
      { threshold: 0.2 }
    );

    if (servicesRef.current) observer.observe(servicesRef.current);

    const timer = setTimeout(() => setShowChatButtonAnimation(true), 2000);

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      if (servicesRef.current) observer.unobserve(servicesRef.current);
      clearTimeout(timer);
    };
  }, []);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (!isChatbotOpen) setShowChatButtonAnimation(false);
  };

  return (
    <div className="bg-white w-full overflow-x-hidden">
      <Navbar pricingRef={pricingRef as React.RefObject<HTMLDivElement>} />

      <div className="dashboard-container min-h-screen relative bg-[url('/assets/pricing.png')] bg-cover">
        <div className="h-[70px]"></div>

        <div className="main-content flex flex-col md:flex-row justify-center items-center text-center mt-10 gap-x-6 px-4 sm:px-6 md:px-16">
          <div className="w-full flex flex-col items-center mx-4 sm:mx-6 md:mx-10">
            <p className="text-4xl md:text-5xl text-[#0F0F0F] mt-10 leading-tight tracking-tight">
              Create incredibly lifelike speech with<br className="" />
              <span className="text-6xl md:text-7xl leading-[1.2]">
                <TypingText />
              </span>
            </p>

            <div className="mt-6">
              <p className="text-[#000000] text-lg md:text-2xl leading-[1.6] tracking-wide max-w-full">
                Driven by pioneering research in Text-to-Speech, voice generation, and conversational AI.
              </p>
            </div>

            <div className="cta mt-10">
              <button
                onClick={() => router.push('/main/googleauth')}
                className="px-6 py-2 text-lg md:text-xl font-medium text-white bg-black rounded-md hover:bg-[#323e45] transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-full">
          <AudioAIPlatform />
        </div>
      </div>

      <div className="bg-[url('/assets/pricing.png')] bg-cover">
        <Divider text="Discover Powerful AI Tools" />
        <div className="w-full overflow-x-hidden">
          <FeaturedAgentsSlider />
        </div>

        <Divider text="Discover Reasonable Pricing" />

        <div ref={pricingRef} className="max-w-full">
          <PricingPage />
        </div>
      </div>

      <button
        className={`fixed bottom-16 right-4 sm:right-6 md:right-10 opacity-90 ${showChatButtonAnimation ? 'animate-pulseButton' : ''} transition-transform hover:scale-110 duration-300`}
        onClick={toggleChatbot}
        aria-label="Open chat"
      >
        <div className="relative">
          <Image src="/assets/msg.png" alt="Chatnow" width={48} height={48} />
          {showChatButtonAnimation && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0088cc] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </span>
          )}
        </div>
      </button>
{/* 
      {isChatbotOpen && <Chatbot onClose={toggleChatbot} />} */}

      <Footer />
    </div>
  );
}