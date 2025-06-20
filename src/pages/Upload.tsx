
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload as UploadIcon, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    policyType: '',
    startDate: '',
    endDate: '',
    monthlyPremium: '',
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate upload and save to Supabase
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Policy uploaded successfully!",
        description: "Your policy has been added to your dashboard.",
      });
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10 p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Upload New Policy</h1>
        </div>
        <p className="text-white/80">Add your insurance policy documents</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <UploadIcon className="w-5 h-5 mr-2" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Policy Document (PDF/DOC)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {formData.file ? (
                      <div className="flex items-center justify-center space-x-2">
                        <File className="w-8 h-8 text-[#183B6B]" />
                        <span className="text-[#183B6B] font-medium">{formData.file.name}</span>
                      </div>
                    ) : (
                      <div>
                        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload your policy document</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX files</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Policy Type */}
              <div className="space-y-2">
                <Label htmlFor="policyType">Policy Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, policyType: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-[#183B6B]">
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

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPremium: e.target.value }))}
                  className="border-gray-300 focus:border-[#183B6B]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold py-4 rounded-xl"
              >
                {loading ? 'Uploading...' : 'Upload Policy'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Upload;
