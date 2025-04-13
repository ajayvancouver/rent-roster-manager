
import { useState } from "react";
import { Maintenance } from "@/types";
import { maintenanceRequests, properties, tenants } from "@/data/mockData";

export function useMaintenanceData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Maintenance["priority"] | "all">("all");
  const [sortField, setSortField] = useState<keyof Maintenance>("dateSubmitted");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    if (priorityFilter !== "all" && request.priority !== priorityFilter) {
      return false;
    }
    
    const searchTerms = searchQuery.toLowerCase();
    const tenantName = getTenantName(request.tenantId).toLowerCase();
    const propertyName = getPropertyName(request.propertyId).toLowerCase();
    
    return (
      request.title.toLowerCase().includes(searchTerms) ||
      request.description.toLowerCase().includes(searchTerms) ||
      tenantName.includes(searchTerms) ||
      propertyName.includes(searchTerms) ||
      request.priority.includes(searchTerms) ||
      request.status.includes(searchTerms)
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortField === "dateSubmitted") {
      return sortDirection === "asc"
        ? new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
        : new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
    } else if (sortField === "priority") {
      const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
      return sortDirection === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const toggleSort = (field: keyof Maintenance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const openRequests = sortedRequests.filter(r => r.status === "pending" || r.status === "in-progress");
  const closedRequests = sortedRequests.filter(r => r.status === "completed" || r.status === "cancelled");

  return {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    sortedRequests,
    openRequests,
    closedRequests,
    toggleSort,
    getTenantName,
    getPropertyName
  };
}
