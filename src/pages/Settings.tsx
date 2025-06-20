
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, HelpCircle, LogOut, Edit } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    policyReminders: true
  });

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
    navigate('/');
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/80">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Profile Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#183B6B] flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="border-gray-300 focus:border-[#183B6B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="border-gray-300 focus:border-[#183B6B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={userInfo.phone}
                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className="border-gray-300 focus:border-[#183B6B]"
              />
            </div>
            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold"
              >
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts on your device</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-gray-500">Get updates via email</p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, emailAlerts: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-gray-500">Receive text messages</p>
              </div>
              <Switch
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Policy Reminders</p>
                <p className="text-sm text-gray-500">Renewal and payment reminders</p>
              </div>
              <Switch
                checked={notifications.policyReminders}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, policyReminders: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Two-Factor Authentication
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Help Center
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Terms of Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
