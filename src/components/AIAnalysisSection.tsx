
import AIAnalysisIndicator from '@/components/AIAnalysisIndicator';

interface AIAnalysisSectionProps {
  file: File | null;
  showAIAnalysis: boolean;
  uploadedPolicyId: string | null;
  tempPolicyForAnalysis: string | null;
  documentText: string;
  documentUrl: string;
  onAnalysisComplete: (analysisResult?: any) => void;
  onPolicyIdNeeded?: () => Promise<{ policyId: string; documentUrl: string } | null>;
}

const AIAnalysisSection = ({
  file,
  showAIAnalysis,
  uploadedPolicyId,
  tempPolicyForAnalysis,
  documentText,
  documentUrl,
  onAnalysisComplete,
  onPolicyIdNeeded
}: AIAnalysisSectionProps) => {
  // Show AI analysis section before upload if file is selected
  if (file && showAIAnalysis && !uploadedPolicyId) {
    return (
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
            onAnalysisComplete={onAnalysisComplete}
            onPolicyIdNeeded={onPolicyIdNeeded}
          />
        </div>
      </div>
    );
  }

  // Show AI analysis section after upload
  if (uploadedPolicyId && showAIAnalysis) {
    return (
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
            onAnalysisComplete={onAnalysisComplete}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default AIAnalysisSection;
