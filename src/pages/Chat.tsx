
import InsuranceChat from '@/components/InsuranceChat';
import BottomNav from '@/components/BottomNav';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Insurance Assistant</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" 
              alt="Padlock Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <p className="text-white/80">Ask me anything about your insurance coverage</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <InsuranceChat />
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
