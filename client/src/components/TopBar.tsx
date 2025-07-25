import { Bell, Menu } from "lucide-react";

interface TopBarProps {
  user: any;
  onMenuToggle?: () => void;
}

export default function TopBar({ user, onMenuToggle }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg mr-3"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your Linux servers in real-time</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">


          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.email || "User"}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <img 
                className="w-8 h-8 rounded-full object-cover" 
                src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "User")}&background=1976D2&color=fff`}
                alt="User profile" 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
