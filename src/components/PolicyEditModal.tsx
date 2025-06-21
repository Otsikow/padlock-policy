
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;
type PolicyType = Policy['policy_type'];

interface PolicyEditModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onPolicyUpdated: () => void;
}

const PolicyEditModal = ({ policy, isOpen, onClose, onPolicyUpdated }: PolicyEditModalProps) => {
  const [formData, setFormData] = useState({
    policy_type: '' as PolicyType,
    policy_number: '',
    premium_amount: '',
    start_date: '',
    end_date: '',
    coverage_summary: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      setFormData({
        policy_type: policy.policy_type,
        policy_number: policy.policy_number || '',
        premium_amount: policy.premium_amount.toString(),
        start_date: policy.start_date,
        end_date: policy.end_date,
        coverage_summary: policy.coverage_summary || ''
      });
    }
  }, [policy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          policy_type: formData.policy_type,
          policy_number: formData.policy_number || null,
          premium_amount: parseFloat(formData.premium_amount),
          start_date: formData.start_date,
          end_date: formData.end_date,
          coverage_summary: formData.coverage_summary || null
        })
        .eq('id', policy.id);

      if (error) throw error;

      toast({
        title: "Policy updated successfully!",
        description: "Your policy details have been saved.",
      });

      onPolicyUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policy_type">Policy Type</Label>
            <Select value={formData.policy_type} onValueChange={(value) => setFormData(prev => ({ ...prev, policy_type: value as PolicyType }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health Insurance</SelectItem>
                <SelectItem value="auto">Auto Insurance</SelectItem>
                <SelectItem value="life">Life Insurance</SelectItem>
                <SelectItem value="home">Home Insurance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_number">Policy Number</Label>
            <Input
              id="policy_number"
              value={formData.policy_number}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
              placeholder="Enter policy number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium_amount">Monthly Premium ($)</Label>
            <Input
              id="premium_amount"
              type="number"
              step="0.01"
              value={formData.premium_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, premium_amount: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage_summary">Coverage Summary</Label>
            <Input
              id="coverage_summary"
              value={formData.coverage_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, coverage_summary: e.target.value }))}
              placeholder="Brief description of coverage"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[#E2B319] hover:bg-[#d4a617] text-black"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyEditModal;
