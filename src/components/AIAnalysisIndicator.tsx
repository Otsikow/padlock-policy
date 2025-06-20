
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysisIndicatorProps {
  policyId: string;
  documentText?: string;
  onAnalysisComplete?: () => void;
}

const AIAnalysisIndicator = ({ policyId, documentText, onAnalysisComplete }: AIAnalysisIndicatorProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeDocument = async () => {
    console.log('Starting AI analysis...', { policyId, hasDocumentText: !!documentText });
    
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-policy', {
        body: {
          documentText: documentText || "",
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
          description: fieldCount > 0 
            ? `Successfully extracted and updated ${fieldCount} fields from your policy document.`
            : "Analysis completed successfully.",
        });
        onAnalysisComplete?.();
      } else {
        throw new Error(data?.error || 'Analysis failed - unknown error');
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      setAnalysisError(error.message);
      toast({
        title: "Analysis Failed",
        description: `Error: ${error.message}. Please try again or contact support if the issue persists.`,
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
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Analysis failed</span>
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeDocument}
          disabled={analyzing}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={analyzeDocument}
      disabled={analyzing}
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
