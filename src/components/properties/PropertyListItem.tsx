
import { Link } from "react-router-dom";
import { Building, Building2, Home } from "lucide-react";
import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PropertyListItemProps {
  property: Property;
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
}

const PropertyListItem = ({ 
  property, 
  getTenantCount, 
  getVacancyCount, 
  getOccupancyRate 
}: PropertyListItemProps) => {
  // Get property type icon
  const renderPropertyTypeIcon = (type: Property["type"]) => {
    switch (type) {
      case "apartment":
        return <Building2 className="h-5 w-5" />;
      case "house":
        return <Home className="h-5 w-5" />;
      case "duplex":
        return <Building className="h-5 w-5" />;
      case "commercial":
        return <Building className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <Card key={property.id} className="card-hover">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {renderPropertyTypeIcon(property.type)}
              </div>
              <div>
                <Link to={`/properties/${property.id}`}>
                  <h3 className="font-semibold hover:underline">{property.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Units</p>
              <p className="font-medium">{property.units}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Tenants</p>
              <p className="font-medium">{getTenantCount(property.id)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Vacancies</p>
              <p className="font-medium">{getVacancyCount(property)}</p>
            </div>
            <div className="text-center">
              <Badge>
                {getOccupancyRate(property)}% Occupied
              </Badge>
            </div>
          </div>
          
          <Link to={`/properties/${property.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyListItem;
