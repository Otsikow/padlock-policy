
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardUpgradeButton = () => {
  return (
    <Card className="bg-gradient-to-r from-[#E2B319] to-[#d4a617] border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Upgrade to Pro</h3>
              <p className="text-sm text-white/80">Unlock premium features</p>
            </div>
          </div>
          <Button 
            asChild
            className="bg-white text-[#E2B319] hover:bg-white/90 font-semibold"
          >
            <Link to="/upgrade">
              <Star className="w-4 h-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardUpgradeButton;
