
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, Calendar, Eye, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import DocumentUpload from '@/components/DocumentUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Document {
  id: string;
  title: string;
  document_type: string;
  document_category: string;
  description?: string;
  file_url: string;
  file_size?: number;
  created_at: string;
}

const Vault = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: "Document deleted",
        description: "The document has been successfully removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'policy': 'bg-purple-100 text-purple-800',
      'receipt': 'bg-green-100 text-green-800',
      'id': 'bg-blue-100 text-blue-800',
      'claim': 'bg-red-100 text-red-800',
      'medical': 'bg-pink-100 text-pink-800',
      'financial': 'bg-yellow-100 text-yellow-800',
      'legal': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576 * 100) / 100 + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/80">Securely store your important documents</p>
        
        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-xl font-bold text-[#E2B319]">{documents.length}</div>
            <div className="text-white/80 text-sm">Documents</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-xl font-bold text-[#E2B319]">
              {Math.round(documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / 1024 / 1024 * 100) / 100}
            </div>
            <div className="text-white/80 text-sm">MB Used</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Upload Section */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-[#183B6B] flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload New Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUpload onUploadComplete={fetchDocuments} />
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B]">Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        {getFileIcon(doc.file_url)}
                        <div>
                          <h3 className="font-medium text-[#183B6B]">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          )}
                          <p className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</p>
                        </div>
                      </div>
                      <Badge className={`${getTypeColor(doc.document_category)} text-xs`}>
                        {doc.document_category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Uploaded {formatDate(doc.created_at)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Vault;
