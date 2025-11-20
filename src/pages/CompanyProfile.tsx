import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Palette, Upload, Image as ImageIcon, Loader2, Building2, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const INSURANCE_TYPES = [
  { id: 'vehicle', label: 'Vehicle Insurance' },
  { id: 'travel', label: 'Travel Insurance' },
  { id: 'health', label: 'Health Insurance' },
  { id: 'home', label: 'Home Insurance' },
  { id: 'life', label: 'Life Insurance' },
  { id: 'business', label: 'Business Insurance' },
  { id: 'other', label: 'Other' },
];

interface OfficeLocation {
  address: string;
  city: string;
  country: string;
  phone: string;
}

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [profileData, setProfileData] = useState({
    logo_url: '',
    brand_color_primary: '#2563eb',
    brand_color_secondary: '#4f46e5',
    company_bio: '',
    customer_support_email: '',
    customer_support_phone: '',
    customer_support_hours: '',
    insurance_types: [] as string[],
  });

  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([
    { address: '', city: '', country: '', phone: '' },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/company/onboarding');
      return;
    }

    if (user) {
      loadCompanyData();
    }
  }, [user, authLoading]);

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

      // Load existing profile if it exists
      const { data: profileData, error: profileError } = await supabase
        .from('insurance_company_profiles')
        .select('*')
        .eq('company_id', data.id)
        .single();

      if (!profileError && profileData) {
        setProfileData({
          logo_url: profileData.logo_url || '',
          brand_color_primary: profileData.brand_color_primary || '#2563eb',
          brand_color_secondary: profileData.brand_color_secondary || '#4f46e5',
          company_bio: profileData.company_bio || '',
          customer_support_email: profileData.customer_support_email || '',
          customer_support_phone: profileData.customer_support_phone || '',
          customer_support_hours: profileData.customer_support_hours || '',
          insurance_types: profileData.insurance_types || [],
        });

        if (profileData.office_locations) {
          setOfficeLocations(profileData.office_locations as OfficeLocation[]);
        }

        if (profileData.logo_url) {
          setLogoPreview(profileData.logo_url);
        }
      }
    } catch (error: any) {
      console.error('Error loading company:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    }
  };

  const handleLogoSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload JPEG, PNG, WebP, or SVG files only',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !company) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${company.id}/logo/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, logoFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const toggleInsuranceType = (type: string) => {
    const updated = profileData.insurance_types.includes(type)
      ? profileData.insurance_types.filter((t) => t !== type)
      : [...profileData.insurance_types, type];

    setProfileData({ ...profileData, insurance_types: updated });
  };

  const addOfficeLocation = () => {
    setOfficeLocations([
      ...officeLocations,
      { address: '', city: '', country: '', phone: '' },
    ]);
  };

  const updateOfficeLocation = (index: number, field: keyof OfficeLocation, value: string) => {
    const updated = [...officeLocations];
    updated[index][field] = value;
    setOfficeLocations(updated);
  };

  const removeOfficeLocation = (index: number) => {
    if (officeLocations.length > 1) {
      setOfficeLocations(officeLocations.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (profileData.insurance_types.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please select at least one insurance type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let logoUrl = profileData.logo_url;

      // Upload logo if a new one was selected
      if (logoFile) {
        logoUrl = (await uploadLogo()) || logoUrl;
      }

      // Filter out empty office locations
      const validOfficeLocations = officeLocations.filter(
        (loc) => loc.address || loc.city || loc.country || loc.phone
      );

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('insurance_company_profiles')
        .select('id')
        .eq('company_id', company.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('insurance_company_profiles')
          .update({
            logo_url: logoUrl,
            brand_color_primary: profileData.brand_color_primary,
            brand_color_secondary: profileData.brand_color_secondary,
            company_bio: profileData.company_bio,
            customer_support_email: profileData.customer_support_email,
            customer_support_phone: profileData.customer_support_phone,
            customer_support_hours: profileData.customer_support_hours,
            insurance_types: profileData.insurance_types,
            office_locations: validOfficeLocations,
          })
          .eq('company_id', company.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('insurance_company_profiles')
          .insert({
            company_id: company.id,
            logo_url: logoUrl,
            brand_color_primary: profileData.brand_color_primary,
            brand_color_secondary: profileData.brand_color_secondary,
            company_bio: profileData.company_bio,
            customer_support_email: profileData.customer_support_email,
            customer_support_phone: profileData.customer_support_phone,
            customer_support_hours: profileData.customer_support_hours,
            insurance_types: profileData.insurance_types,
            office_locations: validOfficeLocations,
          });

        if (error) throw error;
      }

      toast({
        title: 'Profile saved successfully!',
        description: 'Your company profile is ready for review.',
      });

      navigate('/company/pending');
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Company Profile Setup
          </CardTitle>
          <CardDescription className="text-base">
            Set up your brand identity and public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoSelect(file);
                  }}
                />
                <p className="text-sm text-slate-600 mt-1">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Brand Colours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <Label>Brand Colours (Optional)</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Colour</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={profileData.brand_color_primary}
                    onChange={(e) =>
                      setProfileData({ ...profileData, brand_color_primary: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={profileData.brand_color_primary}
                    onChange={(e) =>
                      setProfileData({ ...profileData, brand_color_primary: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Colour</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={profileData.brand_color_secondary}
                    onChange={(e) =>
                      setProfileData({ ...profileData, brand_color_secondary: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={profileData.brand_color_secondary}
                    onChange={(e) =>
                      setProfileData({ ...profileData, brand_color_secondary: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Company Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell customers about your company..."
              rows={4}
              value={profileData.company_bio}
              onChange={(e) =>
                setProfileData({ ...profileData, company_bio: e.target.value })
              }
            />
          </div>

          {/* Insurance Types */}
          <div className="space-y-3">
            <Label>Types of Insurance Offered *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INSURANCE_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={profileData.insurance_types.includes(type.id)}
                    onCheckedChange={() => toggleInsuranceType(type.id)}
                  />
                  <label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Support Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@company.com"
                  value={profileData.customer_support_email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, customer_support_email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-phone">Support Phone</Label>
                <Input
                  id="support-phone"
                  type="tel"
                  placeholder="+44 20 1234 5678"
                  value={profileData.customer_support_phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, customer_support_phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-hours">Support Hours</Label>
              <Input
                id="support-hours"
                placeholder="Mon-Fri 9am-5pm GMT"
                value={profileData.customer_support_hours}
                onChange={(e) =>
                  setProfileData({ ...profileData, customer_support_hours: e.target.value })
                }
              />
            </div>
          </div>

          {/* Office Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Office Locations</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOfficeLocation}>
                Add Location
              </Button>
            </div>

            {officeLocations.map((location, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Location {index + 1}</Label>
                    {officeLocations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOfficeLocation(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Address"
                    value={location.address}
                    onChange={(e) => updateOfficeLocation(index, 'address', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="City"
                      value={location.city}
                      onChange={(e) => updateOfficeLocation(index, 'city', e.target.value)}
                    />
                    <Input
                      placeholder="Country"
                      value={location.country}
                      onChange={(e) => updateOfficeLocation(index, 'country', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Phone"
                    value={location.phone}
                    onChange={(e) => updateOfficeLocation(index, 'phone', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
