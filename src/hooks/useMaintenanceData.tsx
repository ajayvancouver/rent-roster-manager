
import { useState, useEffect, useCallback } from "react";
import { Maintenance } from "@/types";
import { usePropertyManager } from "@/hooks/usePropertyManager";
import { maintenanceService } from "@/services/supabaseService";

export function useMaintenanceData() {
  const {
    tenants,
    properties,
    maintenance: maintenanceRequests,
    isLoading: isDataLoading,
    refreshData: refreshPropertyManagerData
  } = usePropertyManager();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort maintenance requests
  const getFilteredRequests = useCallback(() => {
    return maintenanceRequests.filter(request => {
      // Apply priority filter
      if (priorityFilter !== "all" && request.priority !== priorityFilter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const tenantName = request.tenantId ? getTenantName(request.tenantId).toLowerCase() : "";
        const propertyName = request.propertyId ? getPropertyName(request.propertyId).toLowerCase() : "";
        
        return (
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query) ||
          tenantName.includes(query) ||
          propertyName.includes(query) ||
          request.status.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [maintenanceRequests, priorityFilter, searchQuery]);

  // Sort filtered requests
  const sortRequests = useCallback((requests: Maintenance[]) => {
    return [...requests].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case "priority":
          const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "property":
          valueA = getPropertyName(a.propertyId);
          valueB = getPropertyName(b.propertyId);
          break;
        case "tenant":
          valueA = getTenantName(a.tenantId);
          valueB = getTenantName(b.tenantId);
          break;
        case "date":
        default:
          valueA = new Date(a.dateSubmitted).getTime();
          valueB = new Date(b.dateSubmitted).getTime();
          break;
      }
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDirection]);

  const sortedRequests = sortRequests(getFilteredRequests());
  
  const openRequests = sortedRequests.filter(
    request => request.status === "pending" || request.status === "in-progress"
  );
  
  const closedRequests = sortedRequests.filter(
    request => request.status === "completed" || request.status === "cancelled"
  );

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return "Unassigned";
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return "Unassigned";
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  const handleAddRequest = async (formData: Partial<Maintenance>) => {
    try {
      setIsLoading(true);
      
      await maintenanceService.create({
        ...formData,
        status: "pending"
      } as Maintenance);
      
      // Refresh the data to show the new maintenance request
      refreshPropertyManagerData();
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error adding maintenance request:", error);
      setIsLoading(false);
      return false;
    }
  };

  return {
    maintenanceRequests,
    isLoading: isLoading || isDataLoading,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    toggleSort,
    sortedRequests,
    openRequests,
    closedRequests,
    getTenantName,
    getPropertyName,
    handleAddRequest,
    refreshData: refreshPropertyManagerData
  };
}
