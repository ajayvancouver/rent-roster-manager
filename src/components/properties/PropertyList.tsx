
import { Property } from "@/types";
import PropertyListItem from "./PropertyListItem";

interface PropertyListProps {
  properties: Property[];
  getTenantCount: (propertyId: string) => number;
  getVacancyCount: (property: Property) => number;
  getOccupancyRate: (property: Property) => number;
}

const PropertyList = ({ 
  properties, 
  getTenantCount, 
  getVacancyCount, 
  getOccupancyRate 
}: PropertyListProps) => {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <PropertyListItem
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

export default PropertyList;
