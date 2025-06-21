
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

const UploadHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] to-[#1e4a78] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10 p-2 -ml-2 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold ml-2 drop-shadow-md">Upload New Policy</h1>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/90 drop-shadow-sm">Add your insurance policy documents</p>
      </div>

      {/* AI Feature Highlight */}
      <div className="p-6 pb-0">
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">AI-Powered Analysis</h3>
              <p className="text-sm text-purple-600">Upload PDF, DOC, TXT files or scan with camera and let AI extract key details automatically!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadHeader;
