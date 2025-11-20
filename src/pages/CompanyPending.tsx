import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CompanyPending = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/company/onboarding');
      return;
    }

    if (user) {
      loadCompanyData();
    }
  }, [user, authLoading]);

  const loadCompanyData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCompany(data);

      // Redirect if approved
      if (data.onboarding_status === 'approved') {
        navigate('/partner/dashboard');
      }
    } catch (error: any) {
      console.error('Error loading company:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Company Found</CardTitle>
            <CardDescription>Please complete the onboarding process first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/company/onboarding')} className="w-full">
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (company.onboarding_status) {
      case 'under_review':
        return <Clock className="h-16 w-16 text-amber-500" />;
      case 'approved':
        return <CheckCircle2 className="h-16 w-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (company.onboarding_status) {
      case 'under_review':
        return {
          title: 'Application Under Review',
          description:
            'Thank you for completing your application! Our team is currently reviewing your documents and information. This typically takes 2-3 business days.',
        };
      case 'rejected':
        return {
          title: 'Application Requires Attention',
          description:
            company.rejection_reason ||
            'Your application requires some updates. Please contact our support team for more information.',
        };
      default:
        return {
          title: 'Application Pending',
          description:
            'Your application is being processed. You will receive an email once the review is complete.',
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">{getStatusIcon()}</div>
          <CardTitle className="text-3xl font-bold">{status.title}</CardTitle>
          <CardDescription className="text-base">{status.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Info Summary */}
          <div className="bg-slate-50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg">Application Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Company Name</p>
                <p className="font-medium">{company.legal_name}</p>
              </div>
              <div>
                <p className="text-slate-600">Registration Number</p>
                <p className="font-medium">{company.registration_number}</p>
              </div>
              <div>
                <p className="text-slate-600">Country</p>
                <p className="font-medium">{company.country}</p>
              </div>
              <div>
                <p className="text-slate-600">Phone</p>
                <p className="font-medium">{company.phone}</p>
              </div>
              <div>
                <p className="text-slate-600">Submitted</p>
                <p className="font-medium">
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Status</p>
                <p className="font-medium capitalize">{company.onboarding_status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Our compliance team will verify your documents and company information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>We may contact you for additional information if needed</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Once approved, you'll receive an email with access to the Partner Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You can then start offering your insurance products through Padlock</span>
              </li>
            </ul>
          </div>

          {company.onboarding_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-red-900">Reason for Attention</h4>
              <p className="text-sm text-red-800">
                {company.rejection_reason || 'Please contact support for more information.'}
              </p>
              <Button
                onClick={() => navigate('/company/profile')}
                variant="outline"
                className="w-full mt-2"
              >
                Update Application
              </Button>
            </div>
          )}

          {/* Contact Support */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t">
            <Mail className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">
              Questions?{' '}
              <a href="mailto:support@padlock.com" className="text-blue-600 hover:underline font-medium">
                Contact Support
              </a>
            </span>
          </div>

          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="w-full"
          >
            Return to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPending;
