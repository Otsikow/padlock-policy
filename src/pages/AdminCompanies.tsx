import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminCompanies = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      // Use SECURITY DEFINER RPC function for server-side validation
      const { data: isAdmin, error: rpcError } = await supabase
        .rpc('is_admin');

      if (rpcError) {
        console.error('Error checking admin access:', rpcError);
        throw rpcError;
      }

      if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin access',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      loadCompanies();
    } catch (error: any) {
      console.error('Error checking admin access:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify admin access',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewCompanyDetails = async (company: any) => {
    setSelectedCompany(company);

    try {
      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from('insurance_company_documents')
        .select('*')
        .eq('company_id', company.id);

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('insurance_company_profiles')
        .select('*')
        .eq('company_id', company.id)
        .single();

      if (!profileError) {
        setProfile(profileData);
      }
    } catch (error: any) {
      console.error('Error loading company details:', error);
    }
  };

  const approveCompany = async () => {
    if (!selectedCompany) return;

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('insurance_companies')
        .update({
          onboarding_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          rejection_reason: null,
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      // Send activation email
      try {
        await supabase.functions.invoke('company-activation-email', {
          body: {
            companyId: selectedCompany.id,
            status: 'approved',
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the approval if email fails
      }

      toast({
        title: 'Company Approved',
        description: `${selectedCompany.legal_name} has been approved and activated.`,
      });

      setSelectedCompany(null);
      loadCompanies();
    } catch (error: any) {
      console.error('Error approving company:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve company',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const rejectCompany = async () => {
    if (!selectedCompany || !rejectionReason) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('insurance_companies')
        .update({
          onboarding_status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      // Send rejection email
      try {
        await supabase.functions.invoke('company-activation-email', {
          body: {
            companyId: selectedCompany.id,
            status: 'rejected',
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the rejection if email fails
      }

      toast({
        title: 'Company Rejected',
        description: `${selectedCompany.legal_name} has been notified of the rejection.`,
      });

      setSelectedCompany(null);
      setShowRejectDialog(false);
      setRejectionReason('');
      loadCompanies();
    } catch (error: any) {
      console.error('Error rejecting company:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject company',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending_verification: { variant: 'secondary', label: 'Pending Verification' },
      documents_uploaded: { variant: 'secondary', label: 'Documents Uploaded' },
      under_review: { variant: 'default', label: 'Under Review' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };

    return (
      <Badge variant={config.variant as any} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Insurance Company Management</h1>
          <p className="text-slate-600">Review and approve company applications</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No company applications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <CardTitle className="text-xl">{company.legal_name}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {company.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {company.phone}
                        </span>
                        {company.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {company.website}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(company.onboarding_status)}
                      <span className="text-xs text-slate-500">
                        Applied {new Date(company.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-600">Registration Number</p>
                      <p className="font-medium">{company.registration_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Compliance Officer</p>
                      <p className="font-medium">{company.compliance_officer_name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewCompanyDetails(company)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {company.onboarding_status === 'under_review' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            approveCompany();
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Company Details Dialog */}
      <Dialog open={!!selectedCompany && !showRejectDialog} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCompany?.legal_name}</DialogTitle>
            <DialogDescription>Review company details and documents</DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Registration Number</p>
                  <p className="font-medium">{selectedCompany.registration_number}</p>
                </div>
                <div>
                  <p className="text-slate-600">Country</p>
                  <p className="font-medium">{selectedCompany.country}</p>
                </div>
                <div>
                  <p className="text-slate-600">Phone</p>
                  <p className="font-medium">{selectedCompany.phone}</p>
                </div>
                <div>
                  <p className="text-slate-600">Website</p>
                  <p className="font-medium">{selectedCompany.website || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Compliance Officer</p>
                  <p className="font-medium">{selectedCompany.compliance_officer_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Officer Email</p>
                  <p className="font-medium">{selectedCompany.compliance_officer_email || 'Not provided'}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Uploaded Documents</h3>
                {documents.length === 0 ? (
                  <p className="text-slate-600 text-sm">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm capitalize">
                              {doc.document_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-slate-600">{doc.file_name}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              {profile && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Company Profile</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-600">Insurance Types</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.insurance_types?.map((type: string) => (
                          <Badge key={type} variant="secondary" className="capitalize">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {profile.company_bio && (
                      <div>
                        <p className="text-slate-600">Company Bio</p>
                        <p className="mt-1">{profile.company_bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCompany(null)}>
              Close
            </Button>
            {selectedCompany?.onboarding_status === 'under_review' && (
              <>
                <Button
                  onClick={approveCompany}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Company Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. The company will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              rows={4}
              placeholder="Please explain why this application is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={rejectCompany}
              disabled={actionLoading || !rejectionReason}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanies;
