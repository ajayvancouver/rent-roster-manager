
import { Building2, Home, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/types";

interface PropertyStatsProps {
  properties: Property[];
  getOverallOccupancyRate: () => number;
}

const PropertyStats = ({ properties, getOverallOccupancyRate }: PropertyStatsProps) => {
  const totalUnits = properties.reduce((sum, property) => sum + property.units, 0);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
              <h3 className="text-2xl font-bold">{properties.length}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Units</p>
              <h3 className="text-2xl font-bold">{totalUnits}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-4">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
              <h3 className="text-2xl font-bold">
                {getOverallOccupancyRate()}%
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyStats;
