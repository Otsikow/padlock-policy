
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
    <div className="min-h-screen bg-gradient-to-br from-[#183B6B] via-[#2a5490] to-[#1e4a78] flex items-center justify-center p-4">
      <div className={`max-w-sm w-full text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Padlock</h1>
          <p className="text-white/90 text-lg drop-shadow-md">Insurance Optimization</p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-3">
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md rounded-lg p-3 border border-white/30 shadow-lg">
            <p className="text-white/95 text-sm font-medium">📋 Manage All Policies</p>
          </div>
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md rounded-lg p-3 border border-white/30 shadow-lg">
            <p className="text-white/95 text-sm font-medium">💰 Compare Best Deals</p>
          </div>
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md rounded-lg p-3 border border-white/30 shadow-lg">
            <p className="text-white/95 text-sm font-medium">📄 Quick Claims Process</p>
          </div>
        </div>

        {/* Get Started Button */}
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full bg-gradient-to-r from-[#E2B319] to-[#f5c842] hover:from-[#d4a617] hover:to-[#e6b73a] text-black font-semibold py-4 text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          Get Started
        </Button>

        <p className="text-white/70 text-xs mt-6 drop-shadow-sm">
          Secure • Fast • Reliable
        </p>
      </div>
    </div>
  );
};

export default Index;
