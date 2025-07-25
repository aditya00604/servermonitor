import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Cpu, HardDrive } from "lucide-react";
import CPUChart from "@/components/charts/CPUChart";
import MemoryChart from "@/components/charts/MemoryChart";
import ServerCard from "@/components/ServerCard";
import ChatWidget from "@/components/ChatWidget";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar user={user} />
      <MobileSidebar 
        user={user} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 overflow-auto">
        <TopBar 
          user={user} 
          onMenuToggle={() => setIsMobileMenuOpen(true)} 
        />
        
        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Servers</p>
                  <p className="text-3xl font-bold text-green-900">{servers?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Server className="text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  {servers?.filter((s: any) => s.isOnline).length || 0} online
                </span>
                <span className="text-red-500 ml-3 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  {servers?.filter((s: any) => !s.isOnline).length || 0} offline
                </span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg CPU Usage</p>
                  <p className="text-3xl font-bold text-orange-900">0<span className="text-lg">%</span></p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Cpu className="text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-orange-600 mb-1">
                  <span>CPU Load</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 rounded-full h-2 transition-all duration-300" 
                    style={{width: `0%`}}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Avg Memory Usage</p>
                  <p className="text-3xl font-bold text-purple-900">0<span className="text-lg">%</span></p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HardDrive className="text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-purple-600 mb-1">
                  <span>Memory Load</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 rounded-full h-2 transition-all duration-300" 
                    style={{width: `0%`}}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Server Usage</p>
                  <p className="text-3xl font-bold text-blue-900">{servers?.length || 0}/10</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Server className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-300" 
                    style={{width: `${((servers?.length || 0) / 10) * 100}%`}}
                  ></div>
                </div>
                <p className="text-sm text-blue-600">Up to 10 servers • Free monitoring</p>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CPUChart servers={servers || []} />
            <MemoryChart servers={servers || []} />
          </div>

          {/* Servers List */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Servers</h3>
                <Button 
                  className="bg-primary hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                  onClick={() => window.location.href = '/servers'}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Add Server
                </Button>
              </div>
            </div>

            <CardContent className="p-6">
              {servers && servers.length > 0 ? (
                <div className="grid gap-4">
                  {servers.slice(0, 3).map((server: any) => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                  {servers.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => window.location.href = '/servers'}>
                        View All {servers.length} Servers
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No servers yet</h3>
                  <p className="text-gray-500 mb-6">Add your first server to start monitoring</p>
                  <Button onClick={() => window.location.href = '/servers'}>
                    <Server className="w-4 h-4 mr-2" />
                    Add Your First Server
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
