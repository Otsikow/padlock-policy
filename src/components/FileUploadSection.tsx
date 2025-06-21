
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, File, Brain, Camera } from 'lucide-react';

interface FileUploadSectionProps {
  file: File | null;
  showAIAnalysis: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanDocument: () => void;
}

const FileUploadSection = ({ file, showAIAnalysis, onFileChange, onScanDocument }: FileUploadSectionProps) => {
  const handleChooseFile = () => {
    console.log('Choose File button clicked');
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('File input not found');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file">Policy Document (PDF/DOC/TXT/Image)</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#183B6B] transition-colors bg-gradient-to-br from-gray-50/30 to-blue-50/20">
        <input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-8 h-8 text-[#183B6B]" />
              <span className="text-[#183B6B] font-medium">{file.name}</span>
            </div>
            {showAIAnalysis && (
              <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
                <Brain className="w-4 h-4" />
                <span>Ready for AI analysis</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Upload your policy document</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, TXT, or Image files</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleChooseFile}
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              
              <Button
                type="button"
                onClick={onScanDocument}
                variant="outline"
                className="w-full sm:w-auto border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
