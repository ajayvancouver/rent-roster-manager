
import React from "react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types";
import PropertyListItem from "./PropertyListItem";
import PropertyActionButtons from "./PropertyActionButtons";

interface PropertyListProps {
  properties: Property[];
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
  onEditProperty?: (id: string, data: Partial<Omit<Property, "id">>) => Promise<boolean>;
  onDeleteProperty?: (id: string) => Promise<boolean>;
}

const PropertyList = ({
  properties,
  getTenantCount,
  getVacancyCount,
  getOccupancyRate,
  onEditProperty,
  onDeleteProperty
}: PropertyListProps) => {
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div key={property.id} className="relative">
          <PropertyListItem
            property={property}
            tenantCount={getTenantCount(property.id)}
            vacancyCount={getVacancyCount(property)}
            occupancyRate={getOccupancyRate(property)}
            onClick={() => handlePropertyClick(property.id)}
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

export default PropertyList;
