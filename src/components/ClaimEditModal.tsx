
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;
type Claim = Tables<'claims'>;

interface ClaimEditModalProps {
  claim: Claim;
  policies: Policy[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClaim: Partial<Claim>) => Promise<void>;
}

const ClaimEditModal = ({ claim, policies, isOpen, onClose, onSave }: ClaimEditModalProps) => {
  const { formatAmount, currency } = useCurrency();
  const [editData, setEditData] = useState({
    policy_id: claim.policy_id,
    claim_reason: claim.claim_reason,
    claim_amount: claim.claim_amount ? claim.claim_amount.toString() : '',
  });
  const [saving, setSaving] = useState(false);

  const formatPolicyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedClaim: Partial<Claim> = {
        policy_id: editData.policy_id,
        claim_reason: editData.claim_reason,
        claim_amount: editData.claim_amount ? parseFloat(editData.claim_amount) : null,
        updated_at: new Date().toISOString(),
      };

      await onSave(updatedClaim);
    } catch (error) {
      console.error('Error saving claim:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#183B6B]">Edit Claim</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-policy">Policy</Label>
            <Select value={editData.policy_id} onValueChange={(value) => setEditData(prev => ({ ...prev, policy_id: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-[#183B6B]">
                <SelectValue placeholder="Choose a policy" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {formatPolicyType(policy.policy_type)} Insurance - {formatAmount(Number(policy.premium_amount))}/month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reason">Claim Reason</Label>
            <Textarea
              id="edit-reason"
              value={editData.claim_reason}
              onChange={(e) => setEditData(prev => ({ ...prev, claim_reason: e.target.value }))}
              className="border-gray-300 focus:border-[#183B6B] min-h-[100px]"
              placeholder="Describe your claim in detail..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Claim Amount ({currency.symbol})</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={editData.claim_amount}
              onChange={(e) => setEditData(prev => ({ ...prev, claim_amount: e.target.value }))}
              className="border-gray-300 focus:border-[#183B6B]"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E2B319] hover:bg-[#d4a617] text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimEditModal;
