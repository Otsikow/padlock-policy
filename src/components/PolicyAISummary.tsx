
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileText, Sparkles } from 'lucide-react';
import { AIService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

interface PolicyAISummaryProps {
  policy: Policy;
}

const PolicyAISummary = ({ policy }: PolicyAISummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    ai_summary?: string;
    fine_print_summary?: string;
  }>({
    ai_summary: policy.ai_summary || undefined,
    fine_print_summary: policy.fine_print_summary || undefined,
  });

  const generateSummary = async () => {
    setLoading(true);
    try {
      const result = await AIService.generatePolicySummary({
        policy_type: policy.policy_type,
        premium_amount: Number(policy.premium_amount),
        start_date: policy.start_date,
        end_date: policy.end_date,
        coverage_summary: policy.coverage_summary || undefined,
      });

      if (result) {
        setSummary(result);
        
        // Save to database
        await supabase
          .from('policies')
          .update({
            ai_summary: result.ai_summary,
            fine_print_summary: result.fine_print_summary,
          })
          .eq('id', policy.id);
      }
    } catch (error) {
      console.error('Summary generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSummary = summary.ai_summary || summary.fine_print_summary;

  return (
    <div className="space-y-4">
      {!hasSummary && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-700 mb-2">AI Policy Analysis</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get an AI-powered summary of your policy coverage and fine print
            </p>
            <Button
              onClick={generateSummary}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {summary.ai_summary && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#183B6B] flex items-center text-base">
              <Brain className="w-5 h-5 mr-2" />
              AI Policy Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 leading-relaxed">{summary.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      {summary.fine_print_summary && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#183B6B] flex items-center text-base">
              <FileText className="w-5 h-5 mr-2" />
              Fine Print Explained
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 leading-relaxed">{summary.fine_print_summary}</p>
          </CardContent>
        </Card>
      )}

      {hasSummary && (
        <div className="flex justify-end">
          <Button
            onClick={generateSummary}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Regenerate Summary
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PolicyAISummary;
