import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Server, Edit, Eye, Trash2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServerCardProps {
  server: any;
}

export default function ServerCard({ server }: ServerCardProps) {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [serverName, setServerName] = useState(server.name);

  const updateServerMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("PUT", `/api/servers/${server.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Server updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteServerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/servers/${server.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Success",
        description: "Server deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    if (!serverName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a server name",
        variant: "destructive",
      });
      return;
    }
    updateServerMutation.mutate({ name: serverName.trim() });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this server? This action cannot be undone.")) {
      deleteServerMutation.mutate();
    }
  };

  const formatUptime = (lastSeen: string) => {
    if (!lastSeen) return "--";
    const now = new Date();
    const last = new Date(lastSeen);
    const diff = now.getTime() - last.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const formatLastUpdate = (lastSeen: string) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const last = new Date(lastSeen);
    const diff = now.getTime() - last.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            server.isOnline ? "bg-success/10" : "bg-gray-100"
          }`}>
            <Server className={server.isOnline ? "text-success" : "text-gray-400"} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{server.name}</h4>
            <p className="text-sm text-gray-500">{server.ipAddress || "IP not detected"}</p>
            <div className="flex items-center mt-1 text-xs">
              <span className={`px-2 py-1 rounded-full mr-2 flex items-center ${
                server.isOnline 
                  ? "bg-success text-white" 
                  : "bg-error text-white"
              }`}>
                {server.isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {server.isOnline ? "Online" : "Offline"}
              </span>
              <span className="text-gray-500">
                Last update: {formatLastUpdate(server.lastSeen)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-gray-500">CPU</div>
            <div className={`font-semibold ${
              server.latestMetrics 
                ? server.latestMetrics.cpuUsage > 80 
                  ? "text-error" 
                  : server.latestMetrics.cpuUsage > 60 
                    ? "text-warning" 
                    : "text-success"
                : "text-gray-400"
            }`}>
              {server.latestMetrics ? `${Math.round(server.latestMetrics.cpuUsage)}%` : "--"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Memory</div>
            <div className={`font-semibold ${
              server.latestMetrics 
                ? server.latestMetrics.memoryUsage > 80 
                  ? "text-error" 
                  : server.latestMetrics.memoryUsage > 60 
                    ? "text-warning" 
                    : "text-success"
                : "text-gray-400"
            }`}>
              {server.latestMetrics ? `${Math.round(server.latestMetrics.memoryUsage)}%` : "--"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Uptime</div>
            <div className="font-semibold text-gray-900">
              {formatUptime(server.lastSeen)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setServerName(server.name);
                setShowEditDialog(true);
              }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              title="Remove"
              className="text-error hover:text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editServerName">Server Name</Label>
              <Input
                id="editServerName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="e.g., Production Server 1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateServerMutation.isPending}
              >
                {updateServerMutation.isPending ? "Updating..." : "Update Server"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
