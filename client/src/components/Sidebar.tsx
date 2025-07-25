import { Link, useLocation } from "wouter";
import { Server, BarChart, Key, Settings, LogOut, Gauge, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-64 bg-white shadow-lg hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Server className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ServerWatch</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</h2>
        </div>
        <ul className="space-y-1 px-3">
          <li>
            <Link href="/">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/") 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}>
                <Gauge className="w-4 h-4 mr-3" />
                Dashboard
              </a>
            </Link>
          </li>
          <li>
            <Link href="/servers">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/servers") 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}>
                <Server className="w-4 h-4 mr-3" />
                Servers
              </a>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <Key className="w-4 h-4 mr-3" />
              API Keys
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <BarChart className="w-4 h-4 mr-3" />
              Analytics
            </a>
          </li>
        </ul>

        <div className="px-6 mt-8 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</h2>
        </div>
        <ul className="space-y-1 px-3">
          <li>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </a>
          </li>
          <li>
            <a href="/api/logout" className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
