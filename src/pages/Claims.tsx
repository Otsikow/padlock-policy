import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

const Claims = () => {
  const [claimData, setClaimData] = useState({
    policyId: '',
    reason: '',
    supportingDocs: null as File | null
  });
  const [loading, setLoading] = useState(false);

  // Mock claims data
  const [existingClaims] = useState([
    {
      id: 1,
      policyName: 'Health Insurance Premium',
      reason: 'Medical treatment for accident',
      amount: '$1,200',
      status: 'Pending',
      date: '2024-06-15',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 2,
      policyName: 'Auto Coverage Plan',
      reason: 'Vehicle collision repair',
      amount: '$3,500',
      status: 'Approved',
      date: '2024-06-10',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 3,
      policyName: 'Life Insurance Policy',
      reason: 'Annual health checkup',
      amount: '$150',
      status: 'Rejected',
      date: '2024-06-05',
      statusColor: 'bg-red-100 text-red-800'
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClaimData(prev => ({ ...prev, supportingDocs: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Claim submitted successfully!",
        description: "We'll review your claim and get back to you soon.",
      });
      setClaimData({ policyId: '', reason: '', supportingDocs: null });
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-2">Claims Management</h1>
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
                <Select onValueChange={(value) => setClaimData(prev => ({ ...prev, policyId: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-[#183B6B]">
                    <SelectValue placeholder="Choose a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health Insurance Premium</SelectItem>
                    <SelectItem value="auto">Auto Coverage Plan</SelectItem>
                    <SelectItem value="life">Life Insurance Policy</SelectItem>
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
                disabled={loading}
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
              {existingClaims.map((claim) => (
                <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#183B6B]">{claim.policyName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{claim.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${claim.statusColor}`}>
                      {getStatusIcon(claim.status)}
                      <span>{claim.status}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Amount: {claim.amount}</span>
                    <span>{claim.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Claims;
