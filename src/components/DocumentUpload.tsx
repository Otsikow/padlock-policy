
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !category || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          document_type: category as any,
          document_category: category,
          description,
          file_url: data.publicUrl,
          file_size: selectedFile.size
        });

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded successfully!",
        description: "Your document has been securely stored.",
      });

      // Reset form
      setSelectedFile(null);
      setTitle('');
      setCategory('');
      setDescription('');
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
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
              <File className="w-8 h-8 text-[#183B6B]" />
              <span className="text-[#183B6B] font-medium">{selectedFile.name}</span>
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

      {selectedFile && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="border-gray-300 focus:border-[#183B6B]"
            />
          </div>

          <div>
            <Label htmlFor="category">Document Category</Label>
            <Select onValueChange={setCategory}>
              <SelectTrigger className="border-gray-300 focus:border-[#183B6B]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="policy">Insurance Policy</SelectItem>
                <SelectItem value="receipt">Receipt/Bill</SelectItem>
                <SelectItem value="id">ID Document</SelectItem>
                <SelectItem value="claim">Claim Document</SelectItem>
                <SelectItem value="medical">Medical Record</SelectItem>
                <SelectItem value="financial">Financial Document</SelectItem>
                <SelectItem value="legal">Legal Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              className="border-gray-300 focus:border-[#183B6B]"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
