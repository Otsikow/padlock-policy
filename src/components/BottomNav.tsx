
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, TrendingUp, FolderOpen, Settings } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'compare', label: 'Compare', icon: TrendingUp, path: '/compare' },
    { id: 'claims', label: 'Claims', icon: FileText, path: '/claims' },
    { id: 'vault', label: 'Vault', icon: FolderOpen, path: '/vault' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-[#183B6B] bg-[#183B6B]/10' 
                  : 'text-gray-600 hover:text-[#183B6B] hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#183B6B]' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-[#183B6B]' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
