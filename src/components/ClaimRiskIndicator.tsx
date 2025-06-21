
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Activity } from 'lucide-react';
import { AIService } from '@/services/aiService';

interface ClaimRiskIndicatorProps {
  claimData: {
    policy_type: string;
    claim_reason: string;
    claim_amount?: number;
  };
  onRiskAnalysis?: (analysis: any) => void;
}

const ClaimRiskIndicator = ({ claimData, onRiskAnalysis }: ClaimRiskIndicatorProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (claimData.claim_reason && claimData.policy_type) {
      analyzeRisk();
    }
  }, [claimData]);

  const analyzeRisk = async () => {
    setLoading(true);
    try {
      const result = await AIService.analyzeClaimRisk(claimData);
      if (result) {
        setAnalysis(result);
        onRiskAnalysis?.(result);
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-100 text-green-800';
    if (score <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 30) return <Shield className="w-4 h-4" />;
    if (score <= 60) return <Activity className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Analyzing claim risk...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>AI Risk Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Score:</span>
            <Badge className={getRiskColor(analysis.risk_score)}>
              {getRiskIcon(analysis.risk_score)}
              <span className="ml-1">
                {analysis.risk_score}/100 - {getRiskLabel(analysis.risk_score)}
              </span>
            </Badge>
          </div>

          {analysis.risk_factors && analysis.risk_factors.length > 0 && (
            <div>
              <span className="text-sm font-medium">Risk Factors:</span>
              <ul className="mt-1 space-y-1">
                {analysis.risk_factors.map((factor: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.explanation && (
            <div>
              <span className="text-sm font-medium">Analysis:</span>
              <p className="text-sm text-gray-600 mt-1">{analysis.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimRiskIndicator;
