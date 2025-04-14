
import { Building, Building2, Home, Warehouse } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
}

const PropertyCard = ({
  property,
  getTenantCount,
  getVacancyCount,
  getOccupancyRate,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  
  const tenantCount = getTenantCount(property.id);
  const vacancyCount = getVacancyCount(property);
  const occupancyRate = getOccupancyRate(property);

  const PropertyTypeIcon = () => {
    switch (property.type) {
      case 'house':
        return <Home className="h-5 w-5" />;
      case 'apartment':
        return <Building2 className="h-5 w-5" />;
      case 'duplex':
        return <Building className="h-5 w-5" />;
      case 'commercial':
        return <Warehouse className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <Card className="overflow-hidden">
      {/* Property Image or Placeholder */}
      <div className="h-48 bg-muted relative">
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <PropertyTypeIcon />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="capitalize">
            {property.type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg truncate">{property.name}</h3>
            <p className="text-muted-foreground text-sm truncate">{property.address}</p>
            <p className="text-muted-foreground text-sm truncate">{property.city}, {property.state} {property.zipCode}</p>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm">Units</span>
              <span className="font-medium">{property.units}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Occupied</span>
              <span>{tenantCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Vacant</span>
              <span>{vacancyCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Occupancy</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
