
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PolicyCard from './PolicyCard';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

interface PolicyListProps {
  policies: Policy[];
  onUploadClick: () => void;
  onCancelPolicy: (policyId: string) => void;
  onSwitchPolicy: (policyId: string) => void;
  onPolicyUpdated?: () => void;
}

const PolicyList = ({ policies, onUploadClick, onCancelPolicy, onSwitchPolicy, onPolicyUpdated }: PolicyListProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold bg-gradient-to-r from-[#183B6B] to-[#2a5490] bg-clip-text text-transparent mb-4">My Policies</h2>
      
      {policies.length === 0 ? (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No policies yet</h3>
            <p className="text-gray-500 mb-4">Upload your first insurance policy to get started</p>
            <Button
              onClick={onUploadClick}
              className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] hover:from-[#1a3d6f] hover:to-[#2d5799] text-white"
            >
              Upload Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onCancel={onCancelPolicy}
              onSwitch={onSwitchPolicy}
              onPolicyUpdated={onPolicyUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PolicyList;
