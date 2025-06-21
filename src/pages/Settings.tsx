import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Bell, Shield, HelpCircle, LogOut, Edit, Key, Mail, Phone, MessageSquare, CreditCard, Crown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import PasswordReset from '@/components/PasswordReset';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: ''
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: user?.email || '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    policyReminders: true
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setUserInfo(prev => ({
        ...prev,
        name: data.full_name || ''
      }));
    }
  };

  const handlePhotoUpdate = async (url: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatar_url: url,
        full_name: profile.full_name
      });

    if (!error) {
      setProfile(prev => ({ ...prev, avatar_url: url }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: userInfo.name,
          avatar_url: profile.avatar_url
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, full_name: userInfo.name }));
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
    navigate('/');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@padlockpolicy.com?subject=Support Request';
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
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <ProfilePhotoUpload 
                currentPhotoUrl={profile.avatar_url}
                onPhotoUpdate={handlePhotoUpdate}
              />
            </div>
            
            <div className="space-y-4">
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
                  disabled
                  className="border-gray-300 bg-gray-100"
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
            </div>
          </CardContent>
        </Card>

        {/* Billing & Subscriptions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Billing & Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => navigate('/upgrade')}
            >
              <Crown className="w-4 h-4 mr-2" />
              View Subscription Plans
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => navigate('/services')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Premium Services
            </Button>
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
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 hover:bg-gray-50"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-gray-300 focus:border-[#183B6B]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-gray-300 focus:border-[#183B6B]"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold"
                  >
                    Update Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reset Password via Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <PasswordReset />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              <Shield className="w-4 h-4 mr-2" />
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
              onClick={() => window.open('https://help.padlockpolicy.com', '_blank')}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={handleContactSupport}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('tel:+1-800-PADLOCK', '_blank')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('https://chat.padlockpolicy.com', '_blank')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('/terms', '_blank')}
            >
              Terms of Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('/privacy', '_blank')}
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
