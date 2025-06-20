
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

interface PolicyCardProps {
  policy: Policy;
  onCancel: (policyId: string) => void;
  onSwitch: (policyId: string) => void;
}

const PolicyCard = ({ policy, onCancel, onSwitch }: PolicyCardProps) => {
  const formatPolicyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-[#183B6B]">
              {formatPolicyType(policy.policy_type)} Insurance Policy
            </h3>
            <p className="text-sm text-gray-600">{policy.coverage_summary || 'Insurance Coverage'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            policy.status === 'cancelled' 
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
              : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
          }`}>
            {policy.status === 'cancelled' ? 'Cancelled' : 'Active'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(policy.start_date)} - {formatDate(policy.end_date)}
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-1" />
            ${Number(policy.premium_amount).toFixed(2)}/month
          </div>
        </div>

        {/* Action Buttons */}
        {policy.status !== 'cancelled' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => onSwitch(policy.id)}
              variant="outline"
              size="sm"
              className="flex-1 border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
            >
              Switch Policy
            </Button>
            <Button
              onClick={() => onCancel(policy.id)}
              variant="outline"
              size="sm"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Cancel Policy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyCard;
