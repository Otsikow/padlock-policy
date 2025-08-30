
import { Bell, Settings, User, Plus } from 'lucide-react';
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
    <header className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white p-4 sm:p-6 rounded-b-3xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 border border-white/20">
            <img 
              src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" 
              alt="PadLock Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Welcome back!</h1>
            <p className="text-white/80 text-sm sm:text-base truncate">Manage your insurance policies with ease</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex-shrink-0"
            aria-label="Upload new policy"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            <span className="hidden xs:inline">Upload Policy</span>
            <span className="xs:hidden">Upload</span>
          </Button>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 border border-white/30 hidden sm:block">
            <CurrencySelector minimal={true} />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-white/20 min-w-[40px] min-h-[40px] flex-shrink-0"
            asChild
          >
            <Link to="/settings" aria-label={`Notifications${notifications > 0 ? ` (${notifications} unread)` : ''}`}>
              <Bell className="w-5 h-5" aria-hidden="true" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  aria-label={`${notifications} unread notifications`}
                >
                  {notifications}
                </Badge>
              )}
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 min-w-[40px] min-h-[40px] flex-shrink-0"
            asChild
          >
            <Link to="/settings" aria-label="Settings">
              <Settings className="w-5 h-5" aria-hidden="true" />
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 min-w-[40px] min-h-[40px] flex-shrink-0 p-0"
            asChild
          >
            <Link to="/settings" aria-label="Profile settings">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/20">
                <AvatarImage src="" alt={userEmail ? `${userEmail}'s profile` : "User profile"} />
                <AvatarFallback className="bg-white/10 text-white">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
