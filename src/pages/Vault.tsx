
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, File, Calendar, Eye } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from '@/hooks/use-toast';

const Vault = () => {
  const [documents] = useState([
    {
      id: 1,
      title: 'Driver\'s License',
      type: 'ID',
      uploadDate: '2024-06-15',
      fileType: 'image',
      size: '2.1 MB'
    },
    {
      id: 2,
      title: 'Medical Receipt - Hospital Visit',
      type: 'Receipt',
      uploadDate: '2024-06-12',
      fileType: 'pdf',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Vehicle Registration',
      type: 'Policy',
      uploadDate: '2024-06-10',
      fileType: 'pdf',
      size: '945 KB'
    },
    {
      id: 4,
      title: 'Passport Copy',
      type: 'ID',
      uploadDate: '2024-06-08',
      fileType: 'image',
      size: '3.2 MB'
    },
    {
      id: 5,
      title: 'Property Tax Statement',
      type: 'Receipt',
      uploadDate: '2024-06-05',
      fileType: 'pdf',
      size: '1.5 MB'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload
      setTimeout(() => {
        toast({
          title: "Document uploaded successfully!",
          description: "Your document has been securely stored in your vault.",
        });
        setSelectedFile(null);
      }, 1500);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ID':
        return 'bg-blue-100 text-blue-800';
      case 'Receipt':
        return 'bg-green-100 text-green-800';
      case 'Policy':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              {Math.round(documents.reduce((sum, doc) => sum + parseFloat(doc.size), 0) * 100) / 100}
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-8 h-8 text-[#183B6B]" />
                    <div>
                      <p className="text-[#183B6B] font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Upload your documents</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Images, or Documents</p>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#183B6B]">Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <h3 className="font-medium text-[#183B6B]">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    <Badge className={`${getTypeColor(doc.type)} text-xs`}>
                      {doc.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Uploaded {doc.uploadDate}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Vault;
