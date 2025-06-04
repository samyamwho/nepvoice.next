import React from 'react';
import { useRouter } from 'next/navigation';

const PricingPage: React.FC = () => {
  const router = useRouter();
  // const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  // const [showChatButtonAnimation, setShowChatButtonAnimation] = useState(false);

  // Pricing plans (One-time purchases)
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
      bgColor: 'bg-gradient-to-br from-[#28464E] to-[#1B343A]',
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

  const Divider: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center">
      <div className="h-[2px] w-1/4 bg-gray-300"></div>
      <span className="mx-4 text-lg font-semibold text-gray-600 uppercase">{text}</span>
      <div className="h-[2px] w-1/4 bg-gray-300"></div>
    </div>
  );

  const handlePlanSelect = (plan: typeof plans[0]) => {
    // Store the selected plan in localStorage or state management solution
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    router.push('/checkout');
  };

  return (
    <div className="pricing-page min-h-screen">   

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-30">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-4xl font-bold text-[#172A2F] mb-4">
            Choose Your Credit Package
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Purchase AI credits as needed. No subscriptions just buy, use, and top up when needed.
          </p>
        </div>
  

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${plan.bgColor}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-[#172A2F] px-4 py-1 text-sm font-bold">
                  BEST SELLER
                </div>
              )}

              <div className={`p-8 ${plan.recommended ? 'text-white' : 'text-[#172A2F]'}`}>
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
                        className={`h-5 w-5 mr-2 mt-0.5 ${plan.recommended ? 'text-white' : 'text-[#0088cc]'}`} 
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
                  onClick={() => handlePlanSelect(plan)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      

        {/* FAQ Section */}
        <div className="mt-24">
          <Divider text="Frequently Asked Questions" />
          <h2 className="text-3xl font-bold text-center text-[#172A2F] mt-10 mb-10">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#172A2F] mb-2">How do AI credits work?</h3>
              <p className="text-gray-600">
                AI credits are used to access our services. Each task consumes a set amount of credits based on complexity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#172A2F] mb-2">Do I need a subscription?</h3>
              <p className="text-gray-600">
                No! You only pay for what you need. Buy credits as needed and top up when necessary.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#172A2F] mb-2">Do my credits expire?</h3>
              <p className="text-gray-600">
                Yes, credit validity depends on the package you purchase. Basic credits expire in 7 days, Standard in 30 days, and Best Value in 60 days.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#172A2F] mb-2">Can I purchase more credits anytime?</h3>
              <p className="text-gray-600">
                Absolutely! You can purchase additional credits at any time without restrictions.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;
