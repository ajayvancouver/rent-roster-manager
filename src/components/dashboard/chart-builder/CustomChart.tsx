
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, Move } from "lucide-react";
import { ChartType } from "./ChartTypes";
import { Payment, Tenant, Property } from "@/types";

export interface DataPoint {
  name: string;
  value: number;
  color: string;
}

export interface CustomChartData {
  id: string;
  type: ChartType;
  title: string;
  dataSource: "rent" | "payments" | "occupancy" | "maintenance";
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface CustomChartProps {
  chart: CustomChartData;
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  onRemove: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
}

const COLORS = ["#4ade80", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa"];

export const CustomChart = ({ chart, properties, tenants, payments, onRemove, onMove }: CustomChartProps) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate chart data based on the dataSource
    const generateData = () => {
      switch (chart.dataSource) {
        case "rent":
          return generateRentData();
        case "payments":
          return generatePaymentData();
        case "occupancy":
          return generateOccupancyData();
        case "maintenance":
          return generateMaintenanceData();
        default:
          return [];
      }
    };

    setData(generateData());
  }, [chart.dataSource, properties, tenants, payments]);

  const generateRentData = (): DataPoint[] => {
    if (!tenants.length) return [];
    
    const totalExpected = tenants
      .filter(tenant => tenant.status === 'active')
      .reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
      
    const totalCollected = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
    return [
      { name: "Collected", value: totalCollected, color: COLORS[0] },
      { name: "Outstanding", value: Math.max(0, totalExpected - totalCollected), color: COLORS[1] }
    ];
  };

  const generatePaymentData = (): DataPoint[] => {
    if (!payments.length) return [];
    
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    
    return [
      { name: "Completed", value: completed, color: COLORS[0] },
      { name: "Pending", value: pending, color: COLORS[3] },
      { name: "Failed", value: failed, color: COLORS[1] }
    ];
  };

  const generateOccupancyData = (): DataPoint[] => {
    if (!properties.length) return [];
    
    const totalUnits = properties.reduce((sum, property) => sum + property.units, 0);
    const occupiedUnits = tenants.filter(tenant => tenant.status === 'active').length;
    
    return [
      { name: "Occupied", value: occupiedUnits, color: COLORS[0] },
      { name: "Vacant", value: Math.max(0, totalUnits - occupiedUnits), color: COLORS[1] }
    ];
  };

  const generateMaintenanceData = (): DataPoint[] => {
    return [
      { name: "Completed", value: 5, color: COLORS[0] },
      { name: "In Progress", value: 3, color: COLORS[2] },
      { name: "Pending", value: 2, color: COLORS[3] }
    ];
  };

  const handleDragStart = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.dataTransfer.setData("chartId", chart.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const renderChart = () => {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4ade80" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={30}
                dataKey="value"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const style = {
    position: "absolute",
    left: `${chart.position.x}px`,
    top: `${chart.position.y}px`,
    width: `${chart.size.width}px`,
    height: `${chart.size.height}px`,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;

  return (
    <Card
      style={style}
      className="resize overflow-hidden shadow-lg border-2 border-border hover:border-primary/20 transition-colors"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between cursor-move" onDragStart={handleDragStart}>
        <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(chart.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="bg-muted rounded-sm p-0.5">
            <Move className="h-4 w-4 cursor-move text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 h-[calc(100%-36px)]">
        {renderChart()}
      </CardContent>
    </Card>
  );
};
