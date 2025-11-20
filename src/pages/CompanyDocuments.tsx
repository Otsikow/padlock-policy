import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle2, Loader2, X, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type DocumentType = 'certificate_of_incorporation' | 'insurance_licence' | 'proof_of_address' | 'compliance_document';

interface UploadedDocument {
  type: DocumentType;
  file: File;
  url?: string;
  uploading?: boolean;
}

interface ComplianceOfficer {
  name: string;
  email: string;
  phone: string;
}

const DOCUMENT_TYPES = [
  {
    type: 'certificate_of_incorporation' as DocumentType,
    label: 'Certificate of Incorporation',
    description: 'Official company registration document',
  },
  {
    type: 'insurance_licence' as DocumentType,
    label: 'Insurance Licence',
    description: 'Valid insurance operating licence',
  },
  {
    type: 'proof_of_address' as DocumentType,
    label: 'Proof of Address',
    description: 'Utility bill or bank statement (less than 3 months old)',
  },
  {
    type: 'compliance_document' as DocumentType,
    label: 'Compliance Documents',
    description: 'Additional compliance or regulatory documents',
  },
];

const CompanyDocuments = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [documents, setDocuments] = useState<Map<DocumentType, UploadedDocument>>(new Map());
  const [complianceOfficer, setComplianceOfficer] = useState<ComplianceOfficer>({
    name: '',
    email: '',
    phone: '',
  });

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

      // Pre-fill compliance officer if exists
      if (data.compliance_officer_name) {
        setComplianceOfficer({
          name: data.compliance_officer_name || '',
          email: data.compliance_officer_email || '',
          phone: data.compliance_officer_phone || '',
        });
      }

      // Load existing documents
      const { data: existingDocs, error: docsError } = await supabase
        .from('insurance_company_documents')
        .select('*')
        .eq('company_id', data.id);

      if (!docsError && existingDocs) {
        // Handle existing documents if any
        console.log('Existing documents:', existingDocs);
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

  const handleFileSelect = (type: DocumentType, file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF, JPEG, PNG, or WebP files only',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    const newDocs = new Map(documents);
    newDocs.set(type, { type, file });
    setDocuments(newDocs);
  };

  const removeDocument = (type: DocumentType) => {
    const newDocs = new Map(documents);
    newDocs.delete(type);
    setDocuments(newDocs);
  };

  const uploadDocument = async (type: DocumentType, file: File): Promise<string> => {
    if (!company) throw new Error('Company not found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${company.id}/${type}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('company-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('company-documents')
      .getPublicUrl(filePath);

    // Store in database
    const { error: dbError } = await supabase
      .from('insurance_company_documents')
      .insert({
        company_id: company.id,
        document_type: type,
        file_url: data.publicUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user!.id,
      });

    if (dbError) throw dbError;

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    // Validate all required documents are uploaded
    const requiredDocs: DocumentType[] = ['certificate_of_incorporation', 'insurance_licence', 'proof_of_address'];
    const missingDocs = requiredDocs.filter(type => !documents.has(type));

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing documents',
        description: 'Please upload all required documents',
        variant: 'destructive',
      });
      return;
    }

    // Validate compliance officer details
    if (!complianceOfficer.name || !complianceOfficer.email || !complianceOfficer.phone) {
      toast({
        title: 'Missing information',
        description: 'Please provide compliance officer details',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Upload all documents
      for (const [type, doc] of documents.entries()) {
        if (!doc.url) {
          await uploadDocument(type, doc.file);
        }
      }

      // Update company with compliance officer details
      const { error: updateError } = await supabase
        .from('insurance_companies')
        .update({
          compliance_officer_name: complianceOfficer.name,
          compliance_officer_email: complianceOfficer.email,
          compliance_officer_phone: complianceOfficer.phone,
          onboarding_status: 'under_review',
        })
        .eq('id', company.id);

      if (updateError) throw updateError;

      toast({
        title: 'Documents uploaded successfully!',
        description: 'Your application will now be reviewed by our team.',
      });

      navigate('/company/profile');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload documents. Please try again.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Compliance & Documentation
          </CardTitle>
          <CardDescription className="text-base">
            Upload required documents and provide compliance officer details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Documents</h3>
            {DOCUMENT_TYPES.map((docType) => {
              const uploadedDoc = documents.get(docType.type);
              const isRequired = ['certificate_of_incorporation', 'insurance_licence', 'proof_of_address'].includes(docType.type);

              return (
                <div key={docType.type} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{docType.label}</Label>
                        {isRequired && <span className="text-red-500 text-sm">*</span>}
                      </div>
                      <p className="text-sm text-slate-600">{docType.description}</p>
                    </div>
                    {uploadedDoc ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : null}
                  </div>

                  {uploadedDoc ? (
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium truncate max-w-xs">
                          {uploadedDoc.file.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({(uploadedDoc.file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDocument(docType.type)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(docType.type, file);
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compliance Officer Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Compliance Officer Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officer-name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="officer-name"
                  placeholder="John Smith"
                  className="pl-10"
                  value={complianceOfficer.name}
                  onChange={(e) =>
                    setComplianceOfficer({ ...complianceOfficer, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officer-email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="officer-email"
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10"
                    value={complianceOfficer.email}
                    onChange={(e) =>
                      setComplianceOfficer({ ...complianceOfficer, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officer-phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="officer-phone"
                    type="tel"
                    placeholder="+44 20 1234 5678"
                    className="pl-10"
                    value={complianceOfficer.phone}
                    onChange={(e) =>
                      setComplianceOfficer({ ...complianceOfficer, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Documents...
              </>
            ) : (
              'Submit Documents & Continue'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDocuments;
