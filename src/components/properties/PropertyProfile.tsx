
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types";
import { Building2, Home, Warehouse } from "lucide-react";

interface PropertyProfileProps {
  property: Property;
}

const PropertyProfile: React.FC<PropertyProfileProps> = ({ property }) => {
  const PropertyTypeIcon = () => {
    switch (property.type) {
      case 'house': return <Home className="h-8 w-8 text-primary" />;
      case 'apartment': return <Building2 className="h-8 w-8 text-primary" />;
      case 'duplex': return <Building2 className="h-8 w-8 text-primary" />;
      case 'commercial': return <Warehouse className="h-8 w-8 text-primary" />;
      default: return <Building2 className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4">
        <PropertyTypeIcon />
        <CardTitle>{property.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
          <p>{property.address}, {property.city}, {property.state} {property.zipCode}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Total Units</h4>
            <p>{property.units}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Property Type</h4>
            <p className="capitalize">{property.type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyProfile;
