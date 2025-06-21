import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import DashboardHeader from '@/components/DashboardHeader';
import PolicyList from '@/components/PolicyList';
import PolicyModals from '@/components/PolicyModals';
import SmartNotifications from '@/components/SmartNotifications';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;

const Dashboard = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    handleUrlParams();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    fetchPolicies();
  };

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching policies",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const policyId = urlParams.get('policy_id');

    if (status === 'cancelled' && policyId) {
      toast({
        title: "Policy Cancelled",
        description: "Your policy has been successfully cancelled.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh policies to show updated status
      setTimeout(() => fetchPolicies(), 1000);
    } else if (status === 'switching') {
      toast({
        title: "Finding Better Deals",
        description: "We're searching for better policy options for you.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCancelPolicy = () => {
    if (!selectedPolicyId || !user) return;

    // Get the auth token
    const getAuthToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token;
    };

    getAuthToken().then(token => {
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to cancel your policy.",
          variant: "destructive",
        });
        return;
      }

      const currentUrl = window.location.origin + window.location.pathname;
      const cancelUrl = `https://ryqawthghqhsgjucgong.supabase.co/functions/v1/cancel-policy?policy_id=${selectedPolicyId}&redirect_url=${encodeURIComponent(currentUrl)}`;
      
      // Redirect to external logic
      window.location.href = cancelUrl;
    });

    setShowCancelModal(false);
    setSelectedPolicyId(null);
  };

  const handleSwitchPolicy = () => {
    if (!selectedPolicyId || !user) return;

    // Get the auth token  
    const getAuthToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token;
    };

    getAuthToken().then(token => {
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to switch your policy.",
          variant: "destructive",
        });
        return;
      }

      const compareUrl = window.location.origin + '/compare';
      const switchUrl = `https://ryqawthghqhsgjucgong.supabase.co/functions/v1/switch-policy?from_policy_id=${selectedPolicyId}&redirect_url=${encodeURIComponent(compareUrl)}`;
      
      // Redirect to external logic
      window.location.href = switchUrl;
    });

    setShowSwitchModal(false);
    setSelectedPolicyId(null);
  };

  const openCancelModal = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setShowCancelModal(true);
  };

  const openSwitchModal = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setShowSwitchModal(true);
  };

  const totalPremium = policies
    .filter(policy => policy.status !== 'cancelled')
    .reduce((sum, policy) => sum + Number(policy.premium_amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 pb-20">
      <DashboardHeader
        userEmail={user?.email}
        policiesCount={policies.filter(p => p.status !== 'cancelled').length}
        totalPremium={totalPremium}
        onSignOut={handleSignOut}
        onUploadClick={() => navigate('/upload')}
      />

      <div className="px-4 space-y-6">
        <SmartNotifications />
        
        <PolicyList
          policies={policies}
          onUploadClick={() => navigate('/upload')}
          onCancelPolicy={openCancelModal}
          onSwitchPolicy={openSwitchModal}
          onPolicyUpdated={fetchPolicies}
        />
      </div>

      <PolicyModals
        showCancelModal={showCancelModal}
        showSwitchModal={showSwitchModal}
        onCancelModalChange={setShowCancelModal}
        onSwitchModalChange={setShowSwitchModal}
        onConfirmCancel={handleCancelPolicy}
        onConfirmSwitch={handleSwitchPolicy}
      />

      <BottomNav />
    </div>
  );
};

export default Dashboard;
