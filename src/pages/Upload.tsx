
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] to-[#1e4a78] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10 p-2 -ml-2 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold ml-2 drop-shadow-md">Upload New Policy</h1>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/90 drop-shadow-sm">Add your insurance policy documents</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] bg-clip-text text-transparent flex items-center">
              <UploadIcon className="w-5 h-5 mr-2 text-[#183B6B]" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Policy Document (PDF/DOC)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors bg-gradient-to-br from-gray-50/30 to-blue-50/20">
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
                className="w-full bg-gradient-to-r from-[#E2B319] to-[#f5c842] hover:from-[#d4a617] hover:to-[#e6b73a] text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
