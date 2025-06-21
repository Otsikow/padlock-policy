
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Menu, X, LogOut, Plus, FileText, Shield, DollarSign } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail?: string;
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
  onUploadClick,
}: DashboardHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
              alt="Padlock Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button onClick={onUploadClick} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Button
                onClick={() => { onUploadClick(); setShowMenu(false); }}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
              <Button
                variant="outline"
                onClick={() => { onSignOut(); setShowMenu(false); }}
                className="w-full justify-start"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{policiesCount}</p>
                  <p className="text-xs text-gray-500">Active Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{totalPremium}</p>
                  <p className="text-xs text-gray-500">Total Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Protected
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
