
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building2, Home, Users, Warehouse } from "lucide-react";

interface PropertyInfoCardProps {
  type: 'apartment' | 'house' | 'duplex' | 'commercial';
  units: number;
  occupancyRate: number;
  tenantCount: number;
}

const PropertyInfoCard = ({ type, units, occupancyRate, tenantCount }: PropertyInfoCardProps) => {
  // Get the property type icon
  const PropertyTypeIcon = () => {
    switch (type) {
      case 'house':
        return <Home className="h-5 w-5" />;
      case 'apartment':
        return <Building2 className="h-5 w-5" />;
      case 'commercial':
        return <Warehouse className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PropertyTypeIcon />
            <span className="ml-2 capitalize">{type}</span>
          </div>
          <Badge>{units} Units</Badge>
        </div>
        
        <Separator />
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
          <div className="flex items-center gap-2">
            <Progress value={occupancyRate} className="h-2" />
            <span className="text-sm font-medium">{occupancyRate}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Units</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Occupied: {tenantCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Vacant: {units - tenantCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyInfoCard;
