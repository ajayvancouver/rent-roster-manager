
import { Property } from "@/types";

export function usePropertyStatistics(properties: Property[], tenants: any[]) {
  const getTenantCount = (propertyId: string) => {
    return tenants.filter(tenant => tenant.propertyId === propertyId).length;
  };

  const getVacancyCount = (property: Property) => {
    const occupiedUnits = getTenantCount(property.id);
    return property.units - occupiedUnits;
  };

  const getPropertyTypeIcon = (type: Property["type"]) => {
    return type;
  };

  const getOccupancyRate = (property: Property) => {
    const tenantCount = getTenantCount(property.id);
    return property.units > 0 ? Math.round((tenantCount / property.units) * 100) : 0;
  };

  const getOverallOccupancyRate = () => {
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const totalTenants = tenants.length;
    return totalUnits > 0 ? Math.round((totalTenants / totalUnits) * 100) : 0;
  };

  return {
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate
  };
}
