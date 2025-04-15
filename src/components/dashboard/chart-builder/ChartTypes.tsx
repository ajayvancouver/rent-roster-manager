
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart } from "lucide-react";

export type ChartType = "bar" | "line" | "pie";

interface ChartTypeItemProps {
  type: ChartType;
  name: string;
  icon: React.ReactNode;
  onDragStart: (type: ChartType) => void;
}

const ChartTypeItem = ({ type, name, icon, onDragStart }: ChartTypeItemProps) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("chartType", type);
        onDragStart(type);
      }}
      className="flex items-center gap-3 p-3 rounded-md cursor-move bg-background border border-dashed border-muted-foreground/50 hover:border-primary/50 transition-colors"
    >
      <div className="text-primary">{icon}</div>
      <span className="font-medium">{name}</span>
    </div>
  );
};

interface ChartTypesProps {
  onChartDragStart: (type: ChartType) => void;
}

export const ChartTypes = ({ onChartDragStart }: ChartTypesProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Drag to create chart</h3>
        <div className="space-y-2">
          <ChartTypeItem 
            type="bar" 
            name="Bar Chart" 
            icon={<BarChart3 className="h-5 w-5" />} 
            onDragStart={onChartDragStart} 
          />
          <ChartTypeItem 
            type="line" 
            name="Line Chart" 
            icon={<LineChart className="h-5 w-5" />} 
            onDragStart={onChartDragStart} 
          />
          <ChartTypeItem 
            type="pie" 
            name="Pie Chart" 
            icon={<PieChart className="h-5 w-5" />} 
            onDragStart={onChartDragStart} 
          />
        </div>
      </CardContent>
    </Card>
  );
};
