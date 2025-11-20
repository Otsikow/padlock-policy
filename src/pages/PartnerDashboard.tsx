import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/company/onboarding');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load company
      const { data: companyData, error: companyError } = await supabase
        .from('insurance_companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError) throw companyError;

      setCompany(companyData);

      // Redirect if not approved
      if (companyData.onboarding_status !== 'approved') {
        navigate('/company/pending');
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('insurance_company_profiles')
        .select('*')
        .eq('company_id', companyData.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
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

  if (!company || !profile) {
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

  const stats = [
    {
      title: 'Total Policies',
      value: '0',
      icon: FileText,
      description: 'Policies sold through Padlock',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Customers',
      value: '0',
      icon: Users,
      description: 'Customers using your policies',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Revenue',
      value: '£0',
      icon: TrendingUp,
      description: 'Total revenue generated',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-contain" />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{company.legal_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Verified Partner</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/company/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to the Partner Dashboard!</CardTitle>
            <CardDescription className="text-blue-100">
              Your company has been approved and is now live on Padlock. Start offering your insurance products to customers.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-600 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Company Profile Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Registration Number</p>
                <p className="font-medium">{company.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Country</p>
                <p className="font-medium">{company.country}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Website</p>
                <p className="font-medium">{company.website || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Phone</p>
                <p className="font-medium">{company.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.insurance_types?.map((type: string) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize"
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
              </div>
              {profile.company_bio && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600">About</p>
                  <p className="text-sm mt-1">{profile.company_bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your partnership with Padlock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Add New Policy</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>View Customers</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/company/profile')}>
                <Settings className="h-5 w-5" />
                <span>Update Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;
