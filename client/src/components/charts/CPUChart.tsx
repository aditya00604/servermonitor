import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

interface CPUChartProps {
  servers: any[];
}

export default function CPUChart({ servers }: CPUChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [chart, setChart] = useState<any>(null);

  const { data: metricsData } = useQuery({
    queryKey: ["/api/servers/metrics", timeRange],
    enabled: servers && servers.length > 0,
    queryFn: async () => {
      // Get metrics for the first online server for demo
      const onlineServer = servers.find(s => s.isOnline);
      if (!onlineServer) return null;
      
      const fromDate = new Date();
      switch (timeRange) {
        case "24h":
          fromDate.setHours(fromDate.getHours() - 24);
          break;
        case "7d":
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case "30d":
          fromDate.setDate(fromDate.getDate() - 30);
          break;
      }
      
      const response = await fetch(`/api/servers/${onlineServer.id}/metrics?from=${fromDate.toISOString()}&to=${new Date().toISOString()}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  useEffect(() => {
    const loadChart = async () => {
      if (typeof window !== 'undefined') {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        
        if (canvasRef.current && !chart) {
          const newChart = new Chart(canvasRef.current, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: 'CPU Usage %',
                data: [],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
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
    if (chart && metricsData) {
      const labels = metricsData.map((metric: any) => 
        new Date(metric.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      ).reverse();
      
      const data = metricsData.map((metric: any) => metric.cpuUsage).reverse();
      
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
    }
  }, [chart, metricsData]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">CPU Usage Overview</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-64">
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
}
