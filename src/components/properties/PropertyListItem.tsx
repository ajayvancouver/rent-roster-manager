import { Building, Building2, Home, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types";

interface PropertyListItemProps {
  property: Property;
  getTenantCount: () => number;
  getVacancyCount: () => number;
  getOccupancyRate: () => number;
  onClick?: () => void; // Make onClick optional
}

const PropertyListItem = ({
  property,
  getTenantCount,
  getVacancyCount,
  getOccupancyRate,
  onClick,
}: PropertyListItemProps) => {
  const navigate = useNavigate();
  
  const tenantCount = getTenantCount();
  const vacancyCount = getVacancyCount();
  const occupancyRate = getOccupancyRate();

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
    if (onClick) {
      // Use the provided onClick handler if available
      onClick();
    } else {
      // Otherwise, use default navigation
      navigate(`/properties/${property.id}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Property Info */}
          <div className="flex items-center space-x-4">
            {/* Property Image or Icon */}
            <div className="h-16 w-16 bg-muted flex items-center justify-center rounded">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.name}
                  className="h-full w-full object-cover rounded"
                />
              ) : (
                <PropertyTypeIcon />
              )}
            </div>
            
            {/* Property Details */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{property.name}</h3>
                <Badge className="capitalize text-xs">
                  {property.type}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{property.address}</p>
              <p className="text-muted-foreground text-sm">{property.city}, {property.state} {property.zipCode}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Units</p>
              <p className="font-medium">{property.units}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="font-medium">{tenantCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Vacant</p>
              <p className="font-medium">{vacancyCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Occupancy</p>
              <p className="font-medium">{occupancyRate}%</p>
            </div>
            
            {/* View Button */}
            <Button variant="outline" onClick={handleViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyListItem;
