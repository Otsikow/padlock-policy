
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type PolicyType = Database['public']['Enums']['policy_type_enum'];

interface PolicyFormData {
  policyType: PolicyType | '';
  policyNumber: string;
  startDate: string;
  endDate: string;
  monthlyPremium: string;
  coverageSummary: string;
}

interface PolicyFormProps {
  formData: PolicyFormData;
  loading: boolean;
  onFormDataChange: (data: Partial<PolicyFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PolicyForm = ({ formData, loading, onFormDataChange, onSubmit }: PolicyFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Policy Type */}
      <div className="space-y-2">
        <Label htmlFor="policyType">Policy Type</Label>
        <Select 
          value={formData.policyType} 
          onValueChange={(value) => onFormDataChange({ policyType: value as PolicyType })}
        >
          <SelectTrigger className="border-gray-300 focus:border-[#183B6B] bg-white">
            <SelectValue placeholder="Select policy type" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            <SelectItem value="health">Health Insurance</SelectItem>
            <SelectItem value="auto">Auto Insurance</SelectItem>
            <SelectItem value="life">Life Insurance</SelectItem>
            <SelectItem value="home">Home Insurance</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Policy Number */}
      <div className="space-y-2">
        <Label htmlFor="policyNumber">Policy Number</Label>
        <Input
          id="policyNumber"
          value={formData.policyNumber}
          onChange={(e) => onFormDataChange({ policyNumber: e.target.value })}
          placeholder="Enter policy number (auto-extracted if available)"
          className="border-gray-300 focus:border-[#183B6B]"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onFormDataChange({ startDate: e.target.value })}
            className="border-gray-300 focus:border-[#183B6B]"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onFormDataChange({ endDate: e.target.value })}
            className="border-gray-300 focus:border-[#183B6B]"
            required
          />
        </div>
      </div>

      {/* Monthly Premium */}
      <div className="space-y-2">
        <Label htmlFor="monthlyPremium">Monthly Premium ($)</Label>
        <Input
          id="monthlyPremium"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.monthlyPremium}
          onChange={(e) => onFormDataChange({ monthlyPremium: e.target.value })}
          className="border-gray-300 focus:border-[#183B6B]"
          required
        />
      </div>

      {/* Coverage Summary */}
      <div className="space-y-2">
        <Label htmlFor="coverageSummary">Coverage Summary (Optional)</Label>
        <Input
          id="coverageSummary"
          type="text"
          placeholder="Brief description of coverage"
          value={formData.coverageSummary}
          onChange={(e) => onFormDataChange({ coverageSummary: e.target.value })}
          className="border-gray-300 focus:border-[#183B6B]"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#E2B319] to-[#f5c842] hover:from-[#d4a617] hover:to-[#e6b73a] text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {loading ? 'Uploading...' : 'Upload Policy'}
      </Button>
    </form>
  );
};

export default PolicyForm;
