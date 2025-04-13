
import { Property } from "@/types";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  properties: Property[];
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
}

const PropertyGrid = ({ 
  properties, 
  getTenantCount, 
  getVacancyCount, 
  getOccupancyRate 
}: PropertyGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          getTenantCount={getTenantCount}
          getVacancyCount={getVacancyCount}
          getOccupancyRate={getOccupancyRate}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
