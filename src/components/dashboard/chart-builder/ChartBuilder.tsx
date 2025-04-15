
import { useState } from "react";
import { ChartTypes, ChartType } from "./ChartTypes";
import { ChartBuilderArea } from "./ChartBuilderArea";
import { CustomChartData } from "./CustomChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Property, Tenant, Payment } from "@/types";

interface ChartBuilderProps {
  savedCharts: CustomChartData[];
  onSaveCharts: (charts: CustomChartData[]) => void;
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
}

export const ChartBuilder = ({ 
  savedCharts, 
  onSaveCharts,
  properties,
  tenants,
  payments
}: ChartBuilderProps) => {
  const { toast } = useToast();
  const [customCharts, setCustomCharts] = useState<CustomChartData[]>(savedCharts || []);
  const [activeDragType, setActiveDragType] = useState<ChartType | null>(null);

  const handleChartDragStart = (type: ChartType) => {
    setActiveDragType(type);
  };

  const handleSave = () => {
    onSaveCharts(customCharts);
    toast({
      title: "Charts saved",
      description: "Your custom dashboard layout has been saved."
    });
  };

  const handleReset = () => {
    setCustomCharts(savedCharts || []);
    toast({
      description: "Chart changes reset to last saved state."
    });
  };

  const handleClear = () => {
    setCustomCharts([]);
    toast({
      description: "All charts cleared from the builder."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chart Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        <ChartTypes onChartDragStart={handleChartDragStart} />
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Drag and drop to create your custom dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drag chart types from the left panel onto the canvas below. 
                You can move charts by dragging their headers, and resize them 
                by dragging the bottom-right corner.
              </p>
            </CardContent>
          </Card>
          
          <ChartBuilderArea 
            customCharts={customCharts} 
            setCustomCharts={setCustomCharts}
            properties={properties}
            tenants={tenants}
            payments={payments}
          />
        </div>
      </div>
    </div>
  );
};
