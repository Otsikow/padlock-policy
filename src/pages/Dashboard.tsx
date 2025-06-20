
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, DollarSign } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [policies] = useState([
    {
      id: 1,
      name: 'Health Insurance Premium',
      type: 'Health',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      premium: 450.00,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Auto Coverage Plan',
      type: 'Auto',
      startDate: '2024-02-15',
      endDate: '2025-02-14',
      premium: 320.00,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Life Insurance Policy',
      type: 'Life',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      premium: 180.00,
      status: 'Pending'
    }
  ]);

  const totalPremium = policies.reduce((sum, policy) => sum + policy.premium, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-white/80">Manage your insurance policies</p>
          </div>
          <div className="w-12 h-12 bg-[#E2B319] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">U</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E2B319]">{policies.length}</div>
              <div className="text-white/80 text-sm">Active Policies</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E2B319]">${totalPremium}</div>
              <div className="text-white/80 text-sm">Total Premium</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Upload New Policy Button */}
        <Button
          onClick={() => navigate('/upload')}
          className="w-full mb-6 bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold py-4 rounded-xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Upload New Policy
        </Button>

        {/* My Policies Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#183B6B] mb-4">My Policies</h2>
          <div className="space-y-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#183B6B]">{policy.name}</h3>
                      <p className="text-sm text-gray-600">{policy.type} Insurance</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {policy.startDate} - {policy.endDate}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${policy.premium}/month
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
