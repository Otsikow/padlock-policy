
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload as UploadIcon, File, Brain, Sparkles, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import AIAnalysisIndicator from '@/components/AIAnalysisIndicator';
import CameraCapture from '@/components/CameraCapture';
import type { Database } from '@/integrations/supabase/types';

type PolicyType = Database['public']['Enums']['policy_type_enum'];

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    policyType: '' as PolicyType | '',
    policyNumber: '',
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
  const [tempPolicyForAnalysis, setTempPolicyForAnalysis] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setFormData(prev => ({ ...prev, file }));
      
      // Try to extract text from the file if it's a text-based format
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          console.log('Text extracted from file:', text.length, 'characters');
          setDocumentText(text);
          setShowAIAnalysis(true);
          extractPolicyNumber(text);
        };
        reader.readAsText(file);
      } else {
        // For PDF and other files, we'll show the AI analysis option
        console.log('Non-text file detected, enabling AI analysis');
        setShowAIAnalysis(true);
        toast({
          title: "Document Detected",
          description: "You can now use AI to analyze this document and auto-fill policy details.",
        });
      }
    }
  };

  const handleCameraCapture = (file: File) => {
    console.log('Camera captured file:', file.name, file.type, file.size);
    setFormData(prev => ({ ...prev, file }));
    setShowAIAnalysis(true);
    setShowCamera(false); // Close camera modal
    toast({
      title: "Photo Captured",
      description: "Document photo captured! You can now use AI to analyze it and auto-fill policy details.",
    });
  };

  const extractPolicyNumber = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'extract_policy_number',
          data: { document_text: text }
        }
      });

      if (error) throw error;

      if (data.policy_number && data.confidence > 0.7) {
        setFormData(prev => ({ ...prev, policyNumber: data.policy_number }));
        toast({
          title: "Policy Number Found!",
          description: `Automatically extracted: ${data.policy_number}`,
        });
      }
    } catch (error) {
      console.error('Error extracting policy number:', error);
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
          policy_number: formData.policyNumber || null,
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

  const handleAnalysisComplete = (analysisResult?: any) => {
    console.log('Analysis complete, result:', analysisResult);
    // Update form data with analysis results
    if (analysisResult) {
      setFormData(prev => ({
        ...prev,
        policyType: analysisResult.policy_type || prev.policyType,
        monthlyPremium: analysisResult.premium_amount?.toString() || prev.monthlyPremium,
        endDate: analysisResult.end_date || prev.endDate,
        coverageSummary: analysisResult.coverage_summary || prev.coverageSummary
      }));
    }
    
    toast({
      title: "Analysis Complete!",
      description: "Your policy details have been automatically updated in the form below.",
    });
  };

  // Create a temporary policy for AI analysis before upload
  const createTemporaryPolicyForAnalysis = async (): Promise<{ policyId: string; documentUrl: string } | null> => {
    if (!user || !formData.file) {
      console.log('Cannot create temp policy - missing user or file');
      return null;
    }

    if (tempPolicyForAnalysis && documentUrl) {
      console.log('Temp policy already exists:', tempPolicyForAnalysis, 'with URL:', documentUrl);
      return { policyId: tempPolicyForAnalysis, documentUrl };
    }

    console.log('Creating temporary policy for analysis...');

    try {
      // Upload file to storage first
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `temp_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('File uploaded, public URL:', data.publicUrl);
      const newDocumentUrl = data.publicUrl;
      setDocumentUrl(newDocumentUrl);

      // Create a temporary policy for analysis
      const { data: policyData, error } = await supabase
        .from('policies')
        .insert({
          user_id: user.id,
          policy_type: 'other' as PolicyType, // Default type for analysis
          policy_number: null,
          premium_amount: 0, // Will be updated by AI
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coverage_summary: 'Temporary policy for AI analysis - will be updated',
          document_url: newDocumentUrl
        })
        .select()
        .single();

      if (error) {
        console.error('Policy creation error:', error);
        throw error;
      }

      console.log('Temporary policy created:', policyData.id, 'with URL:', newDocumentUrl);
      setTempPolicyForAnalysis(policyData.id);
      return { policyId: policyData.id, documentUrl: newDocumentUrl };
    } catch (error) {
      console.error('Error creating temporary policy:', error);
      toast({
        title: "Error",
        description: "Failed to prepare document for analysis. Please try again.",
        variant: "destructive",
      });
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
              <p className="text-sm text-purple-600">Upload PDF, DOC, TXT files or scan with camera and let AI extract key details automatically!</p>
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
                <Label htmlFor="file">Policy Document (PDF/DOC/TXT/Image)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors bg-gradient-to-br from-gray-50/30 to-blue-50/20">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
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
                    <div className="space-y-4">
                      <div>
                        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload your policy document</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, TXT, or Image files</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => {
                            console.log('Choose File button clicked');
                            const fileInput = document.getElementById('file') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error('File input not found');
                            }
                          }}
                        >
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={() => {
                            console.log('Scan Document button clicked');
                            setShowCamera(true);
                          }}
                          variant="outline"
                          className="w-full sm:w-auto border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Scan Document
                        </Button>
                      </div>
                    </div>
                  )}
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
                      policyId={tempPolicyForAnalysis}
                      documentText={documentText}
                      documentUrl={documentUrl}
                      onAnalysisComplete={handleAnalysisComplete}
                      onPolicyIdNeeded={createTemporaryPolicyForAnalysis}
                    />
                  </div>
                </div>
              )}

              {/* Policy Type */}
              <div className="space-y-2">
                <Label htmlFor="policyType">Policy Type</Label>
                <Select value={formData.policyType} onValueChange={(value) => setFormData(prev => ({ ...prev, policyType: value as PolicyType }))}>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
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

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Upload;
