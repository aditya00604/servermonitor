import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface MemoryChartProps {
  servers: any[];
}

export default function MemoryChart({ servers }: MemoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<any>(null);

  const { data: latestMetrics } = useQuery({
    queryKey: ["/api/servers/latest-metrics"],
    enabled: servers && servers.length > 0,
    queryFn: async () => {
      // Get latest metrics for all online servers
      const onlineServers = servers.filter(s => s.isOnline && s.latestMetrics);
      if (onlineServers.length === 0) return null;
      
      const totalMemory = onlineServers.reduce((sum, server) => sum + server.latestMetrics.memoryTotal, 0);
      const usedMemory = onlineServers.reduce((sum, server) => sum + server.latestMetrics.memoryUsed, 0);
      const cacheMemory = totalMemory * 0.18; // Estimate cache as 18% of total
      const freeMemory = totalMemory - usedMemory - cacheMemory;
      
      return {
        used: Math.round((usedMemory / totalMemory) * 100),
        cache: Math.round((cacheMemory / totalMemory) * 100),
        free: Math.round((freeMemory / totalMemory) * 100)
      };
    },
  });

  useEffect(() => {
    const loadChart = async () => {
      if (typeof window !== 'undefined') {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        
        if (canvasRef.current && !chart) {
          const newChart = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Used Memory', 'Cache', 'Free Memory'],
              datasets: [{
                data: [42, 18, 40],
                backgroundColor: [
                  '#F44336',
                  '#FF9800', 
                  '#4CAF50'
                ],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 20
                  }
                }
              }
            }
          });
          setChart(newChart);
        }
      }
    };
    
    loadChart();
    
    return () => {
      if (chart) {
        chart.destroy();
        setChart(null);
      }
    };
  }, []);

  useEffect(() => {
    if (chart && latestMetrics) {
      chart.data.datasets[0].data = [latestMetrics.used, latestMetrics.cache, latestMetrics.free];
      chart.update();
    }
  }, [chart, latestMetrics]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Memory Usage Distribution</h3>
        <Button variant="ghost" className="text-sm text-primary hover:text-blue-700 font-medium">
          View Details
        </Button>
      </div>
      <div className="h-64">
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
}
