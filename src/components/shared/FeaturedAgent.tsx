import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import "../../app/globals.css";

interface ServiceCardProps {
  imagesrc: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ imagesrc, title, subtitle, description, path }) => {
  const router = useRouter();

  return (
    <div
      className="service-card bg-white my-5 rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl border-2 border-transparent hover:border-gray-500 font-[Avenir] min-w-[280px] mx-2 cursor-pointer"
      onClick={() => router.push(path)}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-[#02cafc] bg-orange-50 p-6 rounded-full relative w-16 h-16">
          <Image 
            src={imagesrc} 
            alt={title} 
            fill
            className="object-contain"
          />
        </div>

        <div className="text-center space-y-3">
          <div>
            <h3 className="text-2xl font-bold text-[#33475b]">{title}</h3>
            <p className="text-xl font-semibold text-[#33475b]">{subtitle}</p>
          </div>

          <p className="text-[#33475b]">{description}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(path);
          }}
          className="w-full px-6 py-2 text-sm md:text-base font-medium text-[#0088cc] bg-transparent border border-[#0088cc] rounded-md hover:bg-[#28464E] hover:text-white transition-all duration-300"
        >
          Launch
        </button>
      </div>
    </div>
  );
};

const services: ServiceCardProps[] = [
  { imagesrc: "/assets/youtube.png", title: "Youtube Transcript", subtitle: "Generator", description: "Convert YouTube videos to text with ease", path: "/upload" },
  { imagesrc: "/assets/player.png", title: "News Player", subtitle: "Reader", description: "Listen to news articles and summary with AI", path: "/player" },
  { imagesrc: "/assets/note.png", title: "Text Summary", subtitle: "Analyzer", description: "Generate concise summaries from long texts", path: "/text-summary" },
  { imagesrc: "/assets/translate.png", title: "LanguageTranslator", subtitle: "Multi-lingual", description: "Translate content across 100+ languages", path: "/translator" },
  { imagesrc: "/assets/voice.png", title: "Speech to Text", subtitle: "Converter", description: "Transform audio into written content", path: "/speech-to-text" },
  { imagesrc: "/assets/convert.png", title: "Format Converter", subtitle: "Multi-format", description: "Convert between various file formats", path: "/format-converter" },
];

const FeaturedAgentsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const cardsPerView = 3;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (servicesRef.current) observer.observe(servicesRef.current);

    return () => {
      if (servicesRef.current) observer.unobserve(servicesRef.current);
    };
  }, []);

  const nextSlide = () => {
    if (currentIndex < services.length - cardsPerView) {
      setCurrentIndex(currentIndex + 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({
          left: 320,
          behavior: 'smooth'
        });
      }
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({
          left: -320,
          behavior: 'smooth'
        });
      }
    } else {
      // Loop to the end
      const newIndex = services.length - cardsPerView;
      setCurrentIndex(newIndex > 0 ? newIndex : 0);
      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: sliderRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * 320,
        behavior: 'smooth'
      });
    }
  };

  // Add autoplay functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div
      ref={servicesRef}
      className={`services-section px-4 py-16 mx-auto max-w-7xl ${isVisible ? 'visible' : ''}`}
    >
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-5xl font-bold text-[#172A2F] mb-4">Featured Agents</h2>
      </div>

      <div className="relative">
        <button
          onClick={prevSlide}
          className="absolute -left-15 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>

        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-8 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 px-12 transition-transform duration-300">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="absolute -right-15 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          aria-label="Next slide"
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: Math.ceil(services.length / cardsPerView) }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i * cardsPerView)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              i === Math.floor(currentIndex / cardsPerView) ? 'bg-[#000000] scale-125' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedAgentsSlider;