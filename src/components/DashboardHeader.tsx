
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail: string;
  policiesCount: number;
  totalPremium: string; // Changed from number to string to accept formatted currency
  onSignOut: () => void;
  onUploadClick: () => void;
}

const DashboardHeader = ({ 
  userEmail, 
  policiesCount, 
  totalPremium, 
  onSignOut, 
  onUploadClick 
}: DashboardHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] to-[#1e4a78] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold drop-shadow-md">Welcome back!</h1>
            <p className="text-white/90 drop-shadow-sm">{userEmail}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onSignOut}
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
              <div className="text-2xl font-bold text-[#E2B319] drop-shadow-sm">{policiesCount}</div>
              <div className="text-white/90 text-sm">Active Policies</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white/15 to-white/5 border-white/30 backdrop-blur-md shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E2B319] drop-shadow-sm">{totalPremium}</div>
              <div className="text-white/90 text-sm">Total Premium</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload New Policy Button */}
      <div className="p-6">
        <Button
          onClick={onUploadClick}
          className="w-full mb-6 bg-gradient-to-r from-[#E2B319] to-[#f5c842] hover:from-[#d4a617] hover:to-[#e6b73a] text-black font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New Policy
        </Button>
      </div>
    </>
  );
};

export default DashboardHeader;
