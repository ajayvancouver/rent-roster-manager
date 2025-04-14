
import React from "react";
import { Property } from "@/types";
import PropertyCard from "./PropertyCard";
import PropertyActionButtons from "./PropertyActionButtons";

interface PropertyGridProps {
  properties: Property[];
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
  onEditProperty?: (id: string, data: Partial<Omit<Property, "id">>) => Promise<boolean>;
  onDeleteProperty?: (id: string) => Promise<boolean>;
}

const PropertyGrid = ({
  properties,
  getTenantCount,
  getVacancyCount,
  getOccupancyRate,
  onEditProperty,
  onDeleteProperty
}: PropertyGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="relative">
          <PropertyCard
            property={property}
            tenantCount={getTenantCount(property.id)}
            vacancyCount={getVacancyCount(property)}
            occupancyRate={getOccupancyRate(property)}
          />
          <div className="absolute top-2 right-2 z-10">
            <PropertyActionButtons 
              property={property}
              onEdit={onEditProperty ? data => onEditProperty(property.id, data) : undefined}
              onDelete={onDeleteProperty ? () => onDeleteProperty(property.id) : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
