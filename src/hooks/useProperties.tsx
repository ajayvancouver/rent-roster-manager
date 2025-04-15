
import { usePropertiesCore } from "./properties/usePropertiesCore";
import { usePropertyStatistics } from "./properties/usePropertyStatistics";
import { usePropertyActions } from "./properties/usePropertyActions";

export function useProperties() {
  const {
    properties,
    setProperties,
    tenants,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    filteredProperties,
    fetchProperties,
    payments
  } = usePropertiesCore();

  const {
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate,
    getTotalRentCollectionStats
  } = usePropertyStatistics(properties, tenants);

  const {
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty
  } = usePropertyActions(properties, tenants, setProperties, fetchProperties);

  // Calculate rent collection stats
  const rentCollectionStats = getTotalRentCollectionStats(payments);

  return {
    // Core state
    properties,
    tenants,
    payments,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    filteredProperties,
    
    // Statistics methods
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate,
    rentCollectionStats,
    
    // Actions
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty,
    fetchProperties
  };
}
