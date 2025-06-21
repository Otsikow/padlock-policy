
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import CameraCapture from '@/components/CameraCapture';
import UploadHeader from '@/components/UploadHeader';
import FileUploadSection from '@/components/FileUploadSection';
import PolicyForm from '@/components/PolicyForm';
import AIAnalysisSection from '@/components/AIAnalysisSection';
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
    setShowCamera(false);
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
          policy_type: 'other' as PolicyType,
          policy_number: null,
          premium_amount: 0,
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

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 pb-20">
      <UploadHeader />

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
            <div className="space-y-6">
              {/* File Upload */}
              <FileUploadSection
                file={formData.file}
                showAIAnalysis={showAIAnalysis}
                onFileChange={handleFileChange}
                onScanDocument={() => setShowCamera(true)}
              />

              {/* AI Analysis Section - Show when file is selected, before upload */}
              <AIAnalysisSection
                file={formData.file}
                showAIAnalysis={showAIAnalysis}
                uploadedPolicyId={uploadedPolicyId}
                tempPolicyForAnalysis={tempPolicyForAnalysis}
                documentText={documentText}
                documentUrl={documentUrl}
                onAnalysisComplete={handleAnalysisComplete}
                onPolicyIdNeeded={createTemporaryPolicyForAnalysis}
              />

              {/* Policy Form */}
              <PolicyForm
                formData={formData}
                loading={loading}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleSubmit}
              />
            </div>

            {/* AI Analysis Section - Show after upload */}
            <AIAnalysisSection
              file={formData.file}
              showAIAnalysis={showAIAnalysis}
              uploadedPolicyId={uploadedPolicyId}
              tempPolicyForAnalysis={tempPolicyForAnalysis}
              documentText={documentText}
              documentUrl={documentUrl}
              onAnalysisComplete={handleAnalysisComplete}
            />
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
