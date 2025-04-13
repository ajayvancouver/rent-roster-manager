
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  getOccupancyRate 
}: PropertyCardProps) => {
  return (
    <Card key={property.id} className="overflow-hidden card-hover">
      <div className="aspect-video w-full overflow-hidden bg-secondary">
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/properties/${property.id}`}>
            <h3 className="text-lg font-semibold hover:underline">{property.name}</h3>
          </Link>
          <Badge className="capitalize">{property.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {property.address}, {property.city}, {property.state} {property.zipCode}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Units</p>
            <p className="font-medium">{property.units}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tenants</p>
            <p className="font-medium">{getTenantCount(property.id)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vacancies</p>
            <p className="font-medium">{getVacancyCount(property)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Occupancy</p>
            <p className="font-medium">
              {getOccupancyRate(property)}%
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link to={`/properties/${property.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
