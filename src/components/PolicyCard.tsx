
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp, Edit, Trash2, FileText } from 'lucide-react';
import PolicyAISummary from './PolicyAISummary';
import PolicyEditModal from './PolicyEditModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

interface PolicyCardProps {
  policy: Policy;
  onCancel: (policyId: string) => void;
  onSwitch: (policyId: string) => void;
  onPolicyUpdated?: () => void;
}

const PolicyCard = ({ policy, onCancel, onSwitch, onPolicyUpdated }: PolicyCardProps) => {
  const { formatAmount } = useCurrency();
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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-[#183B6B] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>{formatPolicyType(policy.policy_type)} Insurance Policy</span>
                {policy.policy_number && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {policy.policy_number}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{policy.coverage_summary || 'Insurance Coverage'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
              policy.status === 'cancelled' 
                ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
            }`}>
              {policy.status === 'cancelled' ? 'Cancelled' : 'Active'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div className="flex items-center text-gray-600 bg-white/50 p-2 rounded-lg">
              <Calendar className="w-4 h-4 mr-2 text-[#183B6B]" />
              <span className="text-xs sm:text-sm">{formatDate(policy.start_date)} - {formatDate(policy.end_date)}</span>
            </div>
            <div className="flex items-center text-gray-600 bg-white/50 p-2 rounded-lg">
              <span className="w-4 h-4 mr-2 text-[#183B6B] text-lg">💰</span>
              <span className="text-xs sm:text-sm">{formatAmount(Number(policy.premium_amount))}/month</span>
            </div>
          </div>

          {/* AI Summary Toggle */}
          <div className="mb-4">
            <Button
              onClick={() => setShowAISummary(!showAISummary)}
              variant="outline"
              size="sm"
              className="w-full justify-between text-purple-600 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300"
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-[#183B6B] text-[#183B6B] hover:bg-gradient-to-r hover:from-[#183B6B] hover:to-[#2a5490] hover:text-white transition-all duration-300"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-500 text-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this policy? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePolicy}
                    disabled={deleteLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
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
                  className="border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300"
                >
                  Switch
                </Button>
                <Button
                  onClick={() => onCancel(policy.id)}
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-500 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 hover:text-white transition-all duration-300"
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
