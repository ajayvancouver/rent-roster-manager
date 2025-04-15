
import { useState, useRef } from "react";
import { CustomChart, CustomChartData } from "./CustomChart";
import { nanoid } from "@/lib/utils";
import { ChartType } from "./ChartTypes";
import { Payment, Tenant, Property } from "@/types";

interface ChartBuilderAreaProps {
  customCharts: CustomChartData[];
  setCustomCharts: React.Dispatch<React.SetStateAction<CustomChartData[]>>;
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
}

export const ChartBuilderArea = ({ 
  customCharts, 
  setCustomCharts,
  properties,
  tenants,
  payments
}: ChartBuilderAreaProps) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // If no area ref, exit early
    if (!areaRef.current) return;

    // Get drop position relative to the drop area
    const rect = areaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if it's a new chart or moving an existing one
    const chartType = e.dataTransfer.getData("chartType") as ChartType;
    const chartId = e.dataTransfer.getData("chartId");

    if (chartType) {
      // Create a new chart
      const chartSources = ["rent", "payments", "occupancy", "maintenance"] as const;
      const newChart: CustomChartData = {
        id: nanoid(),
        type: chartType,
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        dataSource: chartSources[Math.floor(Math.random() * chartSources.length)],
        position: { x, y: y - 20 }, // Adjust y position to account for header
        size: { width: 350, height: 280 },
      };
      
      setCustomCharts(prev => [...prev, newChart]);
    } else if (chartId) {
      // Move existing chart
      setCustomCharts(prev => 
        prev.map(chart => 
          chart.id === chartId 
            ? { ...chart, position: { x, y: y - 20 } }
            : chart
        )
      );
    }
    
    setActiveDragId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleRemoveChart = (id: string) => {
    setCustomCharts(prev => prev.filter(chart => chart.id !== id));
  };

  const handleMoveChart = (id: string, position: { x: number; y: number }) => {
    setCustomCharts(prev => 
      prev.map(chart => 
        chart.id === id ? { ...chart, position } : chart
      )
    );
  };

  return (
    <div 
      ref={areaRef}
      className="w-full min-h-[400px] border-2 border-dashed border-border rounded-lg p-4 relative mt-4 bg-background/50"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {customCharts.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-muted-foreground">Drag charts here to create your custom dashboard</p>
        </div>
      ) : (
        customCharts.map(chart => (
          <CustomChart
            key={chart.id}
            chart={chart}
            properties={properties}
            tenants={tenants}
            payments={payments}
            onRemove={handleRemoveChart}
            onMove={handleMoveChart}
          />
        ))
      )}
    </div>
  );
};
