import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, CheckCircle, Trash2, Edit, Download, Server, Terminal } from "lucide-react";

interface ServerData {
  id: string;
  name: string;
  apiKey: string;
  isOnline: boolean;
  lastSeen: string;
  ipAddress?: string;
}

export default function ServerManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: servers = [], refetch } = useQuery<ServerData[]>({
    queryKey: ["/api/servers"],
  });

  const addServerMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/servers', { name });
      return response.json();
    },
    onSuccess: (newServer) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Server Added",
        description: `${newServer.name} has been added successfully. Copy the API key and install the monitoring agent.`,
      });
      setIsAddDialogOpen(false);
      setServerName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add server",
        variant: "destructive",
      });
    },
  });

  const deleteServerMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest('DELETE', `/api/servers/${serverId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Server Deleted",
        description: "Server has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete server",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, serverId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(serverId);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadMonitoringAgent = () => {
    window.open('/monitor_agent.py', '_blank');
  };

  const getInstallCommand = (apiKey: string) => {
    return `wget ${window.location.origin}/monitor_agent.py && python3 monitor_agent.py --api-key ${apiKey} --server-url ${window.location.origin}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Server Management</h2>
          <p className="text-gray-600">Monitor up to 10 Linux servers with real-time metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={downloadMonitoringAgent}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Agent
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Server</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input
                    id="serverName"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="e.g., Production Web Server"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => addServerMutation.mutate(serverName)}
                  disabled={!serverName.trim() || addServerMutation.isPending}
                  className="w-full"
                >
                  {addServerMutation.isPending ? "Adding..." : "Add Server"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Usage Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Server className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Server Usage</h4>
                <p className="text-sm text-gray-600">
                  {servers.length}/10 servers configured. {10 - servers.length} slots remaining.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {servers.filter(s => s.isOnline).length} Online
              </div>
              <div className="text-sm text-gray-500">
                {servers.filter(s => !s.isOnline).length} Offline
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <Card key={server.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    server.isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <CardTitle className="text-lg">{server.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteServerMutation.mutate(server.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    server.isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {server.isOnline ? 'Online' : 'Offline'}
                  </span>
                  {server.lastSeen && (
                    <span className="text-xs text-gray-500">
                      Last seen: {new Date(server.lastSeen).toLocaleString()}
                    </span>
                  )}
                </div>
                {server.ipAddress && (
                  <div className="text-xs text-gray-500 mt-1">
                    IP: {server.ipAddress}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">API Key</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-100 p-2 rounded border">
                    {server.apiKey.substring(0, 20)}...
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(server.apiKey, server.id)}
                  >
                    {copiedKey === server.id ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Installation</div>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-3 h-3" />
                    <span>Run on your server:</span>
                  </div>
                  <div className="break-all">
                    {getInstallCommand(server.apiKey)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Server Card (when under limit) */}
        {servers.length < 10 && (
          <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors cursor-pointer"
                onClick={() => setIsAddDialogOpen(true)}>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Server className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Server</h3>
              <p className="text-sm text-gray-500">
                Monitor a new Linux server with real-time metrics
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-medium mb-2">Add Server</h4>
              <p className="text-sm text-gray-600">
                Click "Add Server" and give your server a name
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-medium mb-2">Copy Command</h4>
              <p className="text-sm text-gray-600">
                Copy the installation command with your unique API key
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-medium mb-2">Run on Server</h4>
              <p className="text-sm text-gray-600">
                Execute the command on your Linux server to start monitoring
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}