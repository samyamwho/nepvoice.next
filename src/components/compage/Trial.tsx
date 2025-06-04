import { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
// import { Progress } from '../ui/progress';
// import { 
//   Tabs, 
//   TabsContent, 
//   TabsList, 
//   TabsTrigger 
// } from '../ui/tabs';
import { 
  Mic, 
  MessageSquare, 
  Volume2, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Headphones, 
  Video as VideoIcon,
  PhoneCall
} from 'lucide-react';

export default function AudioAIPlatform() {
  const [textContent, setTextContent] = useState<string>(
    "In the ancient land of Eldoria, where the skies were painted with shades of mystic hues and the forests whispered secrets of old, there existed a dragon named Zephyros. Unlike the fearsome tales of dragons that plagued human hearts with terror, Zephyros was a creature of wonder and wisdom, revered by all who knew of his existence."
  );
  const [charCount, setCharCount] = useState<number>(332);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-10">
      {/* Top Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <Button variant="outline" className="rounded-full flex items-center gap-2 bg-white-100 border-gray hover:border-gray-500">
          <MessageSquare size={18} className="text-black" />
          <span className="font-medium text-black">Text To Speech</span>
        </Button>
        
        <Button variant="outline" className="rounded-full flex items-center gap-2 bg-white-100 border-gray hover:border-gray-500">
          <Mic size={18} className="text-black" />
          <span className="font-medium text-black">Speech To Text</span>
        </Button>
        
        <Button variant="outline" className="rounded-full flex items-center gap-2 bg-white-100 border-gray hover:border-gray-500">
          <PhoneCall size={18} className="text-black" />
          <span className="font-medium text-black">Phone Call</span>
        </Button>
        
        <Button variant="outline" className="rounded-full flex items-center gap-2 bg-white-100 border-gray hover:border-gray-500">
          <MessageSquare size={18} className="text-black" />
          <span className="font-medium text-black">Text To SFX</span>
        </Button>
        
        <Button variant="outline" className="rounded-full flex items-center gap-2 bg-white-100 border-gray hover:border-gray-500">
          <Volume2 size={18} className="text-black" />
          <span className="font-medium text-black">Voice Cloning</span>
        </Button>
      </div>
      
      {/* Main Content Box */}
      <div className="">
        <Textarea 
          value={textContent}
          onChange={(e) => {
            setTextContent(e.target.value);
            setCharCount(e.target.value.length);
          }}
          className="min-h-32 bg-white border-gray-200 mb-4 p-4 text-lg text-gray-500"
        />
        
        {/* Bottom Controls */}
        <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full p-2 h-auto">
              <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden relative">
                <Image 
                  src="/np.png" 
                  alt="Voice avatar" 
                  fill
                  className="object-cover"
                />
              </div>
            </Button>
            <ChevronDown size={16} className="text-gray-500" />
            <ChevronRight size={16} className="text-gray-500" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full flex items-center gap-2 hover:bg-gray-100">
              <BookOpen size={18} className="text-gray-700" />
              <span className="font-medium text-gray-500">Tell A Story</span>
            </Button>
            
            <Button variant="outline" className="rounded-full flex items-center gap-2 hover:bg-gray-100">
              <Headphones size={18} className="text-gray-700" />
              <span className="font-medium text-gray-500">Introduce a podcast</span>
            </Button>
            
            <Button variant="outline" className="rounded-full flex items-center gap-2 hover:bg-gray-100">
              <VideoIcon size={18} className="text-gray-700" />
              <span className="font-medium text-gray-500">Create a Video Voiceover</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{charCount}/500</span>
            <Button size="sm" className="rounded-full bg-black hover:bg-gray-800 text-white p-2 h-auto w-auto">
              <Play size={18} fill="white" />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-[40px]"></div>
      
      
    </div>
  );
}