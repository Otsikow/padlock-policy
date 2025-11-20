import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  FileText,
  Eye,
  Mail,
  Building2,
} from 'lucide-react';

type Company = Tables<'insurance_companies'>;

interface CompanyManagementProps {
  onUpdate?: () => void;
}

export function CompanyManagement({ onUpdate }: CompanyManagementProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (
    companyId: string,
    status: 'approved' | 'rejected' | 'suspended' | 'disabled',
    notes: string
  ) => {
    try {
      const { error } = await supabase
        .from('insurance_companies')
        .update({
          status,
          verification_notes: notes,
          verified_at: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Company ${status} successfully`,
      });

      fetchCompanies();
      onUpdate?.();
      setActionDialogOpen(false);
      setActionNotes('');
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'outline', icon: null },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      suspended: { variant: 'secondary', icon: Pause },
      disabled: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {Icon && <Icon className="h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const ActionDialog = () => (
    <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Company Status</DialogTitle>
          <DialogDescription>
            {selectedCompany?.company_name} - Choose an action
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Verification Notes</Label>
            <Textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add notes about this decision..."
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => selectedCompany && updateCompanyStatus(selectedCompany.id, 'approved', actionNotes)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => selectedCompany && updateCompanyStatus(selectedCompany.id, 'rejected', actionNotes)}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedCompany && updateCompanyStatus(selectedCompany.id, 'suspended', actionNotes)}
              variant="secondary"
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspend
            </Button>
            <Button
              onClick={() => selectedCompany && updateCompanyStatus(selectedCompany.id, 'disabled', actionNotes)}
              variant="outline"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Disable
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ViewDialog = () => (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedCompany?.company_name}</DialogTitle>
          <DialogDescription>Company Details</DialogDescription>
        </DialogHeader>
        {selectedCompany && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Company Number</Label>
                <p className="font-medium">{selectedCompany.company_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Trading Name</Label>
                <p className="font-medium">{selectedCompany.trading_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="font-medium">{selectedCompany.email}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Phone</Label>
                <p className="font-medium">{selectedCompany.phone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">FCA Number</Label>
                <p className="font-medium">{selectedCompany.fca_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">VAT Number</Label>
                <p className="font-medium">{selectedCompany.vat_number || 'N/A'}</p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Address</Label>
              <p className="font-medium">
                {[
                  selectedCompany.address_line1,
                  selectedCompany.address_line2,
                  selectedCompany.city,
                  selectedCompany.postcode,
                  selectedCompany.country,
                ]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </p>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
            </div>

            {selectedCompany.verification_notes && (
              <div>
                <Label className="text-xs text-gray-500">Verification Notes</Label>
                <p className="font-medium text-sm bg-gray-50 p-3 rounded">
                  {selectedCompany.verification_notes}
                </p>
              </div>
            )}

            {selectedCompany.description && (
              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <p className="font-medium text-sm">{selectedCompany.description}</p>
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500">Website</Label>
              <p className="font-medium">
                {selectedCompany.website_url ? (
                  <a
                    href={selectedCompany.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedCompany.website_url}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Insurance Company Management
            </h2>
            <p className="text-gray-600 mt-1">
              Approve, reject, or manage insurance companies
            </p>
          </div>
          <Button onClick={fetchCompanies} variant="outline">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No companies found</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>FCA Number</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.company_name}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{getStatusBadge(company.status)}</TableCell>
                    <TableCell>{company.fca_number || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCompany(company);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setActionDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ActionDialog />
      <ViewDialog />
    </div>
  );
}
