
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, ChevronDown, ChevronUp, Edit, Trash2, FileText } from 'lucide-react';
import PolicyAISummary from './PolicyAISummary';
import PolicyEditModal from './PolicyEditModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

interface PolicyCardProps {
  policy: Policy;
  onCancel: (policyId: string) => void;
  onSwitch: (policyId: string) => void;
  onPolicyUpdated?: () => void;
}

const PolicyCard = ({ policy, onCancel, onSwitch, onPolicyUpdated }: PolicyCardProps) => {
  const [showAISummary, setShowAISummary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatPolicyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeletePolicy = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policy.id);

      if (error) throw error;

      toast({
        title: "Policy deleted",
        description: "The policy has been successfully removed.",
      });

      if (onPolicyUpdated) {
        onPolicyUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-[#183B6B] flex items-center">
                {formatPolicyType(policy.policy_type)} Insurance Policy
                {policy.policy_number && (
                  <span className="ml-2 text-sm text-gray-500 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {policy.policy_number}
                  </span>
                )}
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

          {/* AI Summary Toggle */}
          <div className="mb-4">
            <Button
              onClick={() => setShowAISummary(!showAISummary)}
              variant="outline"
              size="sm"
              className="w-full justify-between text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <span>AI Policy Analysis</span>
              {showAISummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {showAISummary && (
              <div className="mt-3">
                <PolicyAISummary policy={policy} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this policy? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePolicy}
                    disabled={deleteLoading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {policy.status !== 'cancelled' && (
              <>
                <Button
                  onClick={() => onSwitch(policy.id)}
                  variant="outline"
                  size="sm"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  Switch
                </Button>
                <Button
                  onClick={() => onCancel(policy.id)}
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <PolicyEditModal
        policy={policy}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onPolicyUpdated={() => {
          if (onPolicyUpdated) {
            onPolicyUpdated();
          }
        }}
      />
    </>
  );
};

export default PolicyCard;
