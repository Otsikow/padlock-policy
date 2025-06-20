
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import DashboardHeader from '@/components/DashboardHeader';
import PolicyList from '@/components/PolicyList';
import PolicyModals from '@/components/PolicyModals';
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCancelPolicy = async () => {
    if (!selectedPolicyId) return;

    try {
      const { error } = await supabase
        .from('policies')
        .update({ status: 'cancelled' })
        .eq('id', selectedPolicyId);

      if (error) throw error;

      toast({
        title: "Policy Cancelled",
        description: "Your policy has been successfully cancelled.",
      });

      fetchPolicies();
    } catch (error: any) {
      toast({
        title: "Error cancelling policy",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowCancelModal(false);
      setSelectedPolicyId(null);
    }
  };

  const handleSwitchPolicy = () => {
    setShowSwitchModal(false);
    setSelectedPolicyId(null);
    navigate('/compare');
  };

  const openCancelModal = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setShowCancelModal(true);
  };

  const openSwitchModal = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setShowSwitchModal(true);
  };

  const totalPremium = policies.reduce((sum, policy) => sum + Number(policy.premium_amount), 0);

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
        policiesCount={policies.length}
        totalPremium={totalPremium}
        onSignOut={handleSignOut}
        onUploadClick={() => navigate('/upload')}
      />

      <PolicyList
        policies={policies}
        onUploadClick={() => navigate('/upload')}
        onCancelPolicy={openCancelModal}
        onSwitchPolicy={openSwitchModal}
      />

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
