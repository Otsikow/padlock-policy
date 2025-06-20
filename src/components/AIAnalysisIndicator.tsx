
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysisIndicatorProps {
  policyId: string;
  documentText?: string;
  documentUrl?: string;
  onAnalysisComplete?: () => void;
}

const AIAnalysisIndicator = ({ policyId, documentText, documentUrl, onAnalysisComplete }: AIAnalysisIndicatorProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeDocument = async () => {
    console.log('Starting AI analysis...', { 
      policyId, 
      hasDocumentText: !!documentText, 
      documentLength: documentText?.length,
      hasDocumentUrl: !!documentUrl 
    });
    
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-policy', {
        body: {
          documentText: documentText || "",
          documentUrl: documentUrl || "",
          policyId
        }
      });

      console.log('AI analysis response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to call analysis function');
      }

      if (data && data.success) {
        setAnalysisComplete(true);
        const fieldCount = data.updatedFields?.length || 0;
        toast({
          title: "AI Analysis Complete!",
          description: data.message || (fieldCount > 0 
            ? `Successfully extracted and updated ${fieldCount} fields from your policy document.`
            : "Analysis completed successfully."),
        });
        onAnalysisComplete?.();
      } else {
        throw new Error(data?.error || 'Analysis failed - unknown error');
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (errorMessage.includes('quota')) {
        errorMessage = 'OpenAI API quota exceeded. The AI analysis feature is temporarily unavailable due to API limits.';
      } else if (errorMessage.includes('API key')) {
        errorMessage = 'OpenAI API configuration issue. Please contact support.';
      } else if (errorMessage.includes('No document text') || errorMessage.includes('extract text from')) {
        errorMessage = 'Unable to extract text from the document. Please try uploading a text file (.txt) or ensure your PDF contains extractable text (not just images).';
      }
      
      setAnalysisError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (analysisComplete) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">AI Analysis Complete</span>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Analysis failed</span>
        </div>
        <p className="text-xs text-red-500">{analysisError}</p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeDocument}
            disabled={analyzing}
          >
            Retry
          </Button>
          {analysisError.includes('quota') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://platform.openai.com/account/billing', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Check Quota
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={analyzeDocument}
      disabled={analyzing || (!documentText && !documentUrl)}
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300"
    >
      {analyzing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Brain className="w-4 h-4 mr-2" />
          AI Analyze
        </>
      )}
    </Button>
  );
};

export default AIAnalysisIndicator;
