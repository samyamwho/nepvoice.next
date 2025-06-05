// app/prices/page.js
"use client"; // Required for using hooks and event handlers

import { useRouter } from 'next/navigation'; // Changed from next/router
// // Adjust path as needed, assuming components is at root
import { ChevronRight, Sun } from 'lucide-react';

// ... (rest of the component is largely the same as the Pages Router version)

const PricesPage = () => {
  const router = useRouter(); // From next/navigation

  const plans = [
    {
      name: 'Basic',
      credits: 200,
      price: 50,
      features: [
        '200 AI Credits',
        'Basic Support',
        'Access to all agents',
        'Expires in 7 days'
      ],
      recommended: false,
      bgColor: 'bg-white',
      buttonColor: 'border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white'
    },
    {
      name: 'Standard',
      credits: 500,
      price: 100,
      features: [
        '500 AI Credits',
        'Priority Support',
        'Access to all agents',
        'Expires in 30 days',
        'Downloadable results'
      ],
      recommended: true,
      bgColor: 'bg-gradient-to-br from-[#050301] to-[#000000]',
      buttonColor: 'bg-white text-[#0088cc] hover:bg-[#e6f7ff] border-white'
    },
    {
      name: 'Best Value',
      credits: 1000,
      price: 150,
      features: [
        '1000 AI Credits',
        'Premium Support',
        'Access to all agents',
        'Expires in 60 days',
        'Downloadable results',
        'Batch processing'
      ],
      recommended: false,
      bgColor: 'bg-white',
      buttonColor: 'border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white'
    }
  ];

  const handleBuyNow = (plan: { name: string; credits: number; price: number; features: string[]; recommended: boolean; bgColor: string; buttonColor: string; }) => {
    const planQueryParam = encodeURIComponent(JSON.stringify(plan));
    router.push(`/checkout?plan=${planQueryParam}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">


      <div className="flex-1 pricing-page min-h-screen font-normal w-full">
      <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-gray-300 rounded-full p-1">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#0088cc] text-white">New</span>
          </div>
          <span className="text-sm text-black">Creating your Professional Voice Clone just got easier</span>
          <ChevronRight size={16} />
        </div>
        <button className="rounded-full p-2 hover:bg-gray-100 bg-black text-white"> {/* Added text-white for Sun icon visibility */}
          <Sun size={18} />
        </button>
      </header>
        
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-4xl font-bold text-[#172A2F] mb-4">
              Choose Your Credit Package
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Purchase AI credits as needed. No subscriptions just buy, use, and top up when needed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${plan.bgColor}`}
              >
                {plan.recommended && (
                   <div className="absolute top-0 right-0 bg-yellow-400 text-[#000000] px-4 py-1 text-sm font-bold transform translate-x-1/4 -translate-y-1/4 rotate-45 origin-bottom-right"> {/* Improved BEST SELLER banner */}
                    BEST SELLER
                  </div>
                )}

                <div className={`p-8 ${plan.recommended ? 'text-white' : 'text-[#000000]'}`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">रु {plan.price}</span>
                  </div>

                  <div className={`text-lg font-semibold mb-4 ${plan.recommended ? 'text-white' : 'text-[#0088cc]'}`}>
                    {plan.credits} Credits
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg 
                          className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${plan.recommended ? 'text-white' : 'text-[#0088cc]'}`} // Added flex-shrink-0
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`${plan.recommended ? 'text-gray-100' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`w-full py-3 px-6 rounded-lg border-2 font-medium transition-all duration-300 ${plan.buttonColor}`}
                    onClick={() => handleBuyNow(plan)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricesPage;