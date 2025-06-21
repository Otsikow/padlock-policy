
import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import CurrencySelector from './CurrencySelector';

interface DashboardHeaderProps {
  notifications?: number;
  userEmail?: string;
  policiesCount?: number;
  totalPremium?: string;
  onSignOut?: () => void;
  onUploadClick?: () => void;
}

const DashboardHeader = ({ 
  notifications = 0,
  userEmail,
  policiesCount,
  totalPremium,
  onSignOut,
  onUploadClick
}: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-[#183B6B] to-[#2563eb] text-white p-6 rounded-b-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
              alt="PadLock Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-white/80">Manage your insurance policies with ease</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
            <CurrencySelector minimal={true} />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-white/20"
            asChild
          >
            <Link to="/settings">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            asChild
          >
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>
          
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-white/10 text-white">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
