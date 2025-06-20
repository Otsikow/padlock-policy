import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload as UploadIcon, File, Brain, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import AIAnalysisIndicator from '@/components/AIAnalysisIndicator';
import type { Database } from '@/integrations/supabase/types';

type PolicyType = Database['public']['Enums']['policy_type_enum'];

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    policyType: '' as PolicyType | '',
    startDate: '',
    endDate: '',
    monthlyPremium: '',
    coverageSummary: '',
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [uploadedPolicyId, setUploadedPolicyId] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      
      // Try to extract text from the file if it's a text-based format
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setDocumentText(text);
          setShowAIAnalysis(true);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we'll let the AI analysis handle text extraction
        setShowAIAnalysis(true);
        toast({
          title: "PDF Document Detected",
          description: "You can now use AI to analyze your PDF and auto-fill policy details.",
        });
      } else {
        // For other file types (DOC, DOCX, etc.), we'll show the AI analysis option
        setShowAIAnalysis(true);
        toast({
          title: "Document Detected",
          description: "You can now use AI to analyze this document and auto-fill policy details.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload policies.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.policyType) {
      toast({
        title: "Policy type required",
        description: "Please select a policy type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Upload file to storage if present
      let documentUrl = null;
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        documentUrl = data.publicUrl;
        setDocumentUrl(documentUrl);
      }

      const { data: policyData, error } = await supabase
        .from('policies')
        .insert({
          user_id: user.id,
          policy_type: formData.policyType as PolicyType,
          premium_amount: parseFloat(formData.monthlyPremium),
          start_date: formData.startDate,
          end_date: formData.endDate,
          coverage_summary: formData.coverageSummary || `${formData.policyType} insurance coverage`,
          document_url: documentUrl
        })
        .select()
        .single();

      if (error) throw error;

      setUploadedPolicyId(policyData.id);

      toast({
        title: "Policy uploaded successfully!",
        description: "Your policy has been added to your dashboard.",
      });
      
      // If no file was uploaded, go directly to dashboard
      if (!formData.file) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    toast({
      title: "Analysis Complete!",
      description: "Your policy details have been automatically updated.",
    });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  // Create a temporary policy for AI analysis before upload
  const createTemporaryPolicy = async () => {
    if (!user || !formData.file) return null;

    try {
      // Upload file to storage first
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `temp_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setDocumentUrl(data.publicUrl);

      // Create a temporary policy for analysis
      const { data: policyData, error } = await supabase
        .from('policies')
        .insert({
          user_id: user.id,
          policy_type: 'other' as PolicyType, // Default type for analysis
          premium_amount: 0, // Will be updated by AI
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coverage_summary: 'Temporary policy for AI analysis',
          document_url: data.publicUrl
        })
        .select()
        .single();

      if (error) throw error;
      return policyData.id;
    } catch (error) {
      console.error('Error creating temporary policy:', error);
      return null;
    }
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

      {/* AI Feature Highlight */}
      <div className="p-6 pb-0">
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">AI-Powered Analysis</h3>
              <p className="text-sm text-purple-600">Upload PDF, DOC, TXT files and let AI extract key details automatically!</p>
            </div>
          </div>
        </div>
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
                <Label htmlFor="file">Policy Document (PDF/DOC/TXT)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors bg-gradient-to-br from-gray-50/30 to-blue-50/20">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {formData.file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <File className="w-8 h-8 text-[#183B6B]" />
                          <span className="text-[#183B6B] font-medium">{formData.file.name}</span>
                        </div>
                        {showAIAnalysis && (
                          <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
                            <Brain className="w-4 h-4" />
                            <span>Ready for AI analysis</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload your policy document</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, or TXT files</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* AI Analysis Section - Show when file is selected, before upload */}
              {formData.file && showAIAnalysis && !uploadedPolicyId && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-800 mb-1">AI Analysis Available</h3>
                      <p className="text-sm text-purple-600">Analyze your document first to auto-fill the form below</p>
                    </div>
                    <AIAnalysisIndicator
                      policyId={uploadedPolicyId}
                      documentText={documentText}
                      documentUrl={documentUrl}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  </div>
                </div>
              )}

              {/* Policy Type */}
              <div className="space-y-2">
                <Label htmlFor="policyType">Policy Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, policyType: value as PolicyType }))}>
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

              {/* Coverage Summary */}
              <div className="space-y-2">
                <Label htmlFor="coverageSummary">Coverage Summary (Optional)</Label>
                <Input
                  id="coverageSummary"
                  type="text"
                  placeholder="Brief description of coverage"
                  value={formData.coverageSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverageSummary: e.target.value }))}
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

            {/* AI Analysis Section - Show after upload */}
            {uploadedPolicyId && showAIAnalysis && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-800 mb-1">AI Analysis Available</h3>
                    <p className="text-sm text-purple-600">Let AI analyze your document to auto-fill policy details</p>
                  </div>
                  <AIAnalysisIndicator
                    policyId={uploadedPolicyId}
                    documentText={documentText}
                    documentUrl={documentUrl}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Upload;
