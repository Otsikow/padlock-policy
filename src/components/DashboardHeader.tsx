
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail: string;
  policiesCount: number;
  totalPremium: string;
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
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] via-[#3461a8] to-[#1e4a78] text-white p-4 sm:p-6 rounded-b-3xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold drop-shadow-lg">Welcome back!</h1>
            <p className="text-white/90 drop-shadow-sm text-sm sm:text-base break-all sm:break-normal">{userEmail}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onSignOut}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-xl">
              <img 
                src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
                alt="Padlock Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <Card className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#E2B319] drop-shadow-lg">{policiesCount}</div>
              <div className="text-white/95 text-xs sm:text-sm font-medium">Active Policies</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#E2B319] drop-shadow-lg break-all sm:break-normal">{totalPremium}</div>
              <div className="text-white/95 text-xs sm:text-sm font-medium">Total Premium</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload New Policy Button */}
      <div className="p-4 sm:p-6">
        <Button
          onClick={onUploadClick}
          className="w-full mb-6 bg-gradient-to-r from-[#E2B319] via-[#f5c842] to-[#f0c432] hover:from-[#d4a617] hover:via-[#e6b73a] hover:to-[#d9b82e] text-black font-semibold py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New Policy
        </Button>
      </div>
    </>
  );
};

export default DashboardHeader;
