
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#183B6B] to-[#2a5490] flex items-center justify-center p-4">
      <div className={`max-w-sm w-full text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/95b681ce-5792-40f4-8a40-28ccfc635d0f.png" 
              alt="Padlock Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Padlock</h1>
          <p className="text-white/80 text-lg">Insurance Optimization</p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-white/90 text-sm">📋 Manage All Policies</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-white/90 text-sm">💰 Compare Best Deals</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-white/90 text-sm">📄 Quick Claims Process</p>
          </div>
        </div>

        {/* Get Started Button */}
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
        >
          Get Started
        </Button>

        <p className="text-white/60 text-xs mt-6">
          Secure • Fast • Reliable
        </p>
      </div>
    </div>
  );
};

export default Index;
