
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
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center py-2 px-2 sm:px-4 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 sm:p-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                isActive 
                  ? 'text-purple-600 bg-purple-600/10' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-600'}`} 
                aria-hidden="true"
              />
              <span className={`text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
