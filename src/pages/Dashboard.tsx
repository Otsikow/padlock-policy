import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, DollarSign, LogOut, X, AlertTriangle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

  const totalPremium = policies.reduce((sum, policy) => sum + Number(policy.premium_amount), 0);

  const formatPolicyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

      fetchPolicies(); // Refresh the policies list
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
      {/* Header */}
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] to-[#1e4a78] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold drop-shadow-md">Welcome back!</h1>
            <p className="text-white/90 drop-shadow-sm">{user?.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
                alt="Padlock Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="bg-gradient-to-br from-white/15 to-white/5 border-white/30 backdrop-blur-md shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E2B319] drop-shadow-sm">{policies.length}</div>
              <div className="text-white/90 text-sm">Active Policies</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white/15 to-white/5 border-white/30 backdrop-blur-md shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E2B319] drop-shadow-sm">${totalPremium.toFixed(2)}</div>
              <div className="text-white/90 text-sm">Total Premium</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Upload New Policy Button */}
        <Button
          onClick={() => navigate('/upload')}
          className="w-full mb-6 bg-gradient-to-r from-[#E2B319] to-[#f5c842] hover:from-[#d4a617] hover:to-[#e6b73a] text-black font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Upload New Policy
        </Button>

        {/* My Policies Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#183B6B] to-[#2a5490] bg-clip-text text-transparent mb-4">My Policies</h2>
          
          {policies.length === 0 ? (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No policies yet</h3>
                <p className="text-gray-500 mb-4">Upload your first insurance policy to get started</p>
                <Button
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] hover:from-[#1a3d6f] hover:to-[#2d5799] text-white"
                >
                  Upload Policy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#183B6B]">
                          {formatPolicyType(policy.policy_type)} Insurance Policy
                        </h3>
                        <p className="text-sm text-gray-600">{policy.coverage_summary || 'Insurance Coverage'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        policy.status === 'cancelled' 
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                      }`}>
                        {policy.status === 'cancelled' ? 'Cancelled' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(policy.start_date)} - {formatDate(policy.end_date)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${Number(policy.premium_amount).toFixed(2)}/month
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {policy.status !== 'cancelled' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openSwitchModal(policy.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
                        >
                          Switch Policy
                        </Button>
                        <Button
                          onClick={() => openCancelModal(policy.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Cancel Policy
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Policy Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Cancel Policy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this policy? This action cannot be undone and you may lose coverage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelModal(false)}>
              No, Keep Policy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPolicy}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Switch Policy Modal */}
      <AlertDialog open={showSwitchModal} onOpenChange={setShowSwitchModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to Another Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to explore better insurance deals and switch to another policy? We'll show you competitive rates from other providers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSwitchModal(false)}>
              No, Stay Here
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSwitchPolicy}
              className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] hover:from-[#1a3d6f] hover:to-[#2d5799]"
            >
              Yes, Find Better Deals
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
