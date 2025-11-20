import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, Phone, Globe, MapPin, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COUNTRIES = [
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Ireland',
  'New Zealand',
  'Singapore',
  'Hong Kong',
  'United Arab Emirates',
  'Other'
];

const companyFormSchema = z.object({
  // Account Info
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),

  // Company Details
  legalName: z.string().min(2, 'Legal name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  country: z.string().min(1, 'Please select a country'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      legalName: '',
      registrationNumber: '',
      website: '',
      country: '',
      phone: '',
    },
  });

  const country = watch('country');

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            company_name: data.legalName,
            role: 'insurance_company',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Step 2: Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'insurance_company',
          country: data.country,
          full_name: data.legalName,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Step 3: Create insurance company record
      const { error: companyError } = await supabase
        .from('insurance_companies')
        .insert({
          user_id: authData.user.id,
          legal_name: data.legalName,
          registration_number: data.registrationNumber,
          website: data.website || null,
          country: data.country,
          phone: data.phone,
          onboarding_status: 'pending_verification',
        });

      if (companyError) throw companyError;

      toast({
        title: 'Account created successfully!',
        description: 'Please verify your email to continue with the onboarding process.',
      });

      // Navigate to verification page
      navigate('/company/verify');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Insurance Company Registration
          </CardTitle>
          <CardDescription className="text-base">
            Join Padlock as a verified insurance partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Account Creation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Account Credentials</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="company@example.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Company Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Company Name *</Label>
                <Input
                  id="legalName"
                  placeholder="ABC Insurance Ltd."
                  {...register('legalName')}
                />
                {errors.legalName && (
                  <p className="text-sm text-red-500">{errors.legalName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Company Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="12345678"
                    {...register('registrationNumber')}
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country of Operation *</Label>
                  <Select
                    value={country}
                    onValueChange={(value) => setValue('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+44 20 1234 5678"
                      className="pl-10"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      className="pl-10"
                      {...register('website')}
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue'}
            </Button>

            <p className="text-sm text-center text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOnboarding;
