
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
    fetchProperties
  } = usePropertiesCore();

  const {
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate
  } = usePropertyStatistics(properties, tenants);

  const {
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty
  } = usePropertyActions(properties, tenants, setProperties, fetchProperties);

  return {
    // Core state
    properties,
    tenants,
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
    
    // Actions
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty,
    fetchProperties
  };
}
