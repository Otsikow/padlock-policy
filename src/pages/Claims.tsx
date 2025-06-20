
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;
type Claim = Tables<'claims'>;

const Claims = () => {
  const { user } = useAuth();
  const [claimData, setClaimData] = useState({
    policyId: '',
    reason: '',
    claimAmount: '',
    supportingDocs: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [existingClaims, setExistingClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (user) {
      fetchPolicies();
      fetchClaims();
    }
  }, [user]);

  const fetchPolicies = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error: any) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchClaims = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingClaims(data || []);
    } catch (error: any) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClaimData(prev => ({ ...prev, supportingDocs: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit claims.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('claims')
        .insert({
          user_id: user.id,
          policy_id: claimData.policyId,
          claim_reason: claimData.reason,
          claim_amount: claimData.claimAmount ? parseFloat(claimData.claimAmount) : null,
          claim_documents: claimData.supportingDocs ? `uploaded/${claimData.supportingDocs.name}` : null,
          claim_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Claim submitted successfully!",
        description: "We'll review your claim and get back to you soon.",
      });
      
      setClaimData({ policyId: '', reason: '', claimAmount: '', supportingDocs: null });
      fetchClaims(); // Refresh claims list
    } catch (error: any) {
      toast({
        title: "Claim submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPolicyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getPolicyName = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    return policy ? `${formatPolicyType(policy.policy_type)} Insurance` : 'Unknown Policy';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/80">Submit and track your insurance claims</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Submit New Claim */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Submit New Claim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policy">Select Policy</Label>
                <Select value={claimData.policyId} onValueChange={(value) => setClaimData(prev => ({ ...prev, policyId: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-[#183B6B] bg-white">
                    <SelectValue placeholder="Choose a policy" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {policies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {formatPolicyType(policy.policy_type)} Insurance - ${policy.premium_amount}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Claim Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe your claim in detail..."
                  value={claimData.reason}
                  onChange={(e) => setClaimData(prev => ({ ...prev, reason: e.target.value }))}
                  className="border-gray-300 focus:border-[#183B6B] min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount ($) - Optional</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={claimData.claimAmount}
                  onChange={(e) => setClaimData(prev => ({ ...prev, claimAmount: e.target.value }))}
                  className="border-gray-300 focus:border-[#183B6B]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#183B6B] transition-colors">
                  <input
                    id="documents"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="documents" className="cursor-pointer">
                    {claimData.supportingDocs ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-6 h-6 text-[#183B6B]" />
                        <span className="text-[#183B6B] font-medium">{claimData.supportingDocs.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload supporting documents</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Images, or Documents</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !claimData.policyId}
                className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold py-3 rounded-lg"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Claims */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B]">Your Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingClaims.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No claims submitted yet</p>
                </div>
              ) : (
                existingClaims.map((claim) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#183B6B]">{getPolicyName(claim.policy_id)}</h3>
                        <p className="text-sm text-gray-600 mt-1">{claim.claim_reason}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(claim.claim_status || 'pending')}`}>
                        {getStatusIcon(claim.claim_status || 'pending')}
                        <span>{claim.claim_status || 'Pending'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {claim.claim_amount ? `Amount: $${Number(claim.claim_amount).toFixed(2)}` : 'Amount: TBD'}
                      </span>
                      <span>{new Date(claim.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Claims;
