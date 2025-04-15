
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

  // Calculate total rent and collected rent
  const getTotalRentCollectionStats = (payments: any[]) => {
    const totalExpectedRent = tenants
      .filter(tenant => tenant.status === 'active')
      .reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
    
    const totalCollectedRent = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const collectionRate = totalExpectedRent > 0 
      ? Math.round((totalCollectedRent / totalExpectedRent) * 100)
      : 0;
    
    return {
      totalExpectedRent,
      totalCollectedRent,
      collectionRate,
      outstandingBalance: totalExpectedRent - totalCollectedRent
    };
  };

  return {
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate,
    getTotalRentCollectionStats
  };
}
