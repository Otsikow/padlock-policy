import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Mail, Phone, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CompanyVerification = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/company/onboarding');
      return;
    }

    if (user) {
      loadCompanyData();
      checkEmailVerification();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const loadCompanyData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCompany(data);
      setPhoneVerified(data.phone_verified || false);
      setEmailVerified(data.email_verified || false);
    } catch (error: any) {
      console.error('Error loading company:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    }
  };

  const checkEmailVerification = async () => {
    if (!user) return;

    // Check if email is verified in auth.users
    const { data: { user: currentUser }, error } = await supabase.auth.getUser();

    if (!error && currentUser?.email_confirmed_at) {
      setEmailVerified(true);

      // Update company record
      await supabase
        .from('insurance_companies')
        .update({ email_verified: true })
        .eq('user_id', user.id);
    }
  };

  const sendPhoneOtp = async () => {
    if (!company) return;

    setLoading(true);

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      const { error } = await supabase
        .from('insurance_company_verifications')
        .insert({
          company_id: company.id,
          verification_type: 'phone',
          verification_value: company.phone,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // In a real app, you would send the OTP via SMS using a service like Twilio
      // For now, we'll show it in a toast (remove this in production!)
      toast({
        title: 'OTP Sent',
        description: `Development Mode: Your OTP is ${otp}. In production, this would be sent via SMS.`,
        duration: 10000,
      });

      setOtpSent(true);
      setResendTimer(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!company || !phoneOtp) return;

    setLoading(true);

    try {
      // Find valid OTP
      const { data: verifications, error: fetchError } = await supabase
        .from('insurance_company_verifications')
        .select('*')
        .eq('company_id', company.id)
        .eq('verification_type', 'phone')
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (!verifications || verifications.length === 0) {
        throw new Error('No valid OTP found. Please request a new one.');
      }

      const verification = verifications[0];

      if (verification.otp_code !== phoneOtp) {
        throw new Error('Invalid OTP. Please try again.');
      }

      // Mark verification as verified
      const { error: updateVerificationError } = await supabase
        .from('insurance_company_verifications')
        .update({ verified: true })
        .eq('id', verification.id);

      if (updateVerificationError) throw updateVerificationError;

      // Update company record
      const { error: updateCompanyError } = await supabase
        .from('insurance_companies')
        .update({
          phone_verified: true,
          onboarding_status: 'documents_uploaded'
        })
        .eq('id', company.id);

      if (updateCompanyError) throw updateCompanyError;

      setPhoneVerified(true);

      toast({
        title: 'Phone verified!',
        description: 'Your phone number has been verified successfully.',
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (emailVerified && phoneVerified) {
      navigate('/company/documents');
    } else {
      toast({
        title: 'Verification required',
        description: 'Please verify both email and phone to continue.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Verify Your Contact Details
          </CardTitle>
          <CardDescription className="text-base">
            Please verify your email and phone number to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
              </div>
              {emailVerified ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <span className="text-sm text-amber-600 font-medium">Pending</span>
              )}
            </div>
            {!emailVerified && (
              <p className="text-sm text-slate-600 px-4">
                Please check your email inbox and click the verification link we sent you.
              </p>
            )}
          </div>

          {/* Phone Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-slate-600">{company?.phone}</p>
                </div>
              </div>
              {phoneVerified ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <span className="text-sm text-amber-600 font-medium">Pending</span>
              )}
            </div>

            {!phoneVerified && (
              <div className="space-y-3 px-4">
                {!otpSent ? (
                  <Button
                    onClick={sendPhoneOtp}
                    disabled={loading || resendTimer > 0}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : resendTimer > 0 ? (
                      `Resend OTP in ${resendTimer}s`
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="phoneOtp">Enter 6-Digit Code</Label>
                      <Input
                        id="phoneOtp"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <Button
                      onClick={verifyPhoneOtp}
                      disabled={loading || phoneOtp.length !== 6}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Phone'
                      )}
                    </Button>
                    <Button
                      onClick={sendPhoneOtp}
                      disabled={loading || resendTimer > 0}
                      variant="ghost"
                      className="w-full"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!emailVerified || !phoneVerified}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Continue to Document Upload
          </Button>

          {(!emailVerified || !phoneVerified) && (
            <p className="text-sm text-center text-amber-600">
              Both email and phone verification required to continue
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyVerification;
