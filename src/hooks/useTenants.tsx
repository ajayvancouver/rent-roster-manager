
import { Tenant } from "@/types";
import { useTenantData } from "./useTenantData";
import { useTenantFilters } from "./useTenantFilters";
import { useTenantActions } from "./useTenantActions";

export function useTenants() {
  const { 
    tenants, 
    setTenants, 
    properties, 
    isLoading, 
    getPropertyName 
  } = useTenantData();
  
  const { 
    searchQuery, 
    setSearchQuery, 
    sortField, 
    sortDirection, 
    toggleSort, 
    getFilteredTenants, 
    getSortedTenants 
  } = useTenantFilters(tenants);
  
  const { 
    handleAddTenant,
    handleUpdateTenant,
    handleDeleteTenant 
  } = useTenantActions(tenants, setTenants, properties);

  const filteredTenants = getFilteredTenants(getPropertyName);
  const sortedTenants = getSortedTenants(filteredTenants);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return {
    tenants,
    properties,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    getPropertyName,
    toggleSort,
    handleAddTenant,
    handleUpdateTenant,
    handleDeleteTenant,
    sortedTenants,
    activeTenants: filteredTenants.filter(t => t.status === "active"),
    inactiveTenants: filteredTenants.filter(t => t.status !== "active"),
    formatDate
  };
}
