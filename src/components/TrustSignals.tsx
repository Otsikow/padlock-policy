
import { Check } from 'lucide-react';

const TrustSignals = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-1" />
          30-day money-back guarantee
        </div>
        <div className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-1" />
          Cancel anytime
        </div>
        <div className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-1" />
          Secure payments by Stripe
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;
