
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Property, Tenant } from "@/types";

interface PropertyOccupancyCardProps {
  properties?: Property[];
  tenants?: Tenant[];
}

const PropertyOccupancyCard = ({ properties: propProperties, tenants: propTenants }: PropertyOccupancyCardProps) => {
  const [properties, setProperties] = useState<Property[]>(propProperties || []);
  const [tenants, setTenants] = useState<Tenant[]>(propTenants || []);
  const [isLoading, setIsLoading] = useState(!propProperties || !propTenants);

  useEffect(() => {
    if (propProperties && propTenants) {
      setProperties(propProperties);
      setTenants(propTenants);
      setIsLoading(false);
    }
  }, [propProperties, propTenants]);

  const getPropertyData = () => {
    return properties.map(property => {
      const totalUnits = property.units;
      const occupiedUnits = tenants.filter(tenant => 
        tenant.propertyId === property.id && tenant.status === 'active'
      ).length;
      
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
      return {
        ...property,
        occupiedUnits,
        occupancyRate
      };
    });
  };
  
  const propertyData = getPropertyData();
  
  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle>Property Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading property data...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle>Property Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        {propertyData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No properties found</p>
        ) : (
          <div className="space-y-4">
            {propertyData.map(property => (
              <div key={property.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{property.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {property.occupiedUnits}/{property.units} units
                  </span>
                </div>
                <Progress value={property.occupancyRate} className="h-2" />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{property.occupancyRate}% occupied</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOccupancyCard;
