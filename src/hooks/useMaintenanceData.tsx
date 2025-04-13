
import { useState, useEffect } from "react";
import { Maintenance, Tenant, Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { maintenanceService, tenantsService, propertiesService } from "@/services/supabaseService";

export function useMaintenanceData() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [maintenanceRequests, setMaintenanceRequests] = useState<Maintenance[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Maintenance["priority"] | "all">("all");
  const [sortField, setSortField] = useState<keyof Maintenance>("dateSubmitted");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managerId = profile?.id || user?.id;
        
        const [fetchedRequests, fetchedTenants, fetchedProperties] = await Promise.all([
          maintenanceService.getAll(managerId),
          tenantsService.getAll(managerId),
          propertiesService.getAll(managerId)
        ]);
        
        console.log("Fetched maintenance requests:", fetchedRequests);
        setMaintenanceRequests(fetchedRequests);
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching maintenance data:", error);
        toast({
          title: "Error",
          description: "Failed to load maintenance data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, user, profile]);

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  const getFilteredRequests = () => {
    return maintenanceRequests.filter(request => {
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
  };

  const sortedRequests = () => {
    const filteredRequests = getFilteredRequests();
    
    return [...filteredRequests].sort((a, b) => {
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
  };

  const toggleSort = (field: keyof Maintenance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleAddRequest = async (formData: Omit<Maintenance, "id" | "dateSubmitted" | "propertyName" | "tenantName" | "tenantEmail">) => {
    try {
      const managerId = profile?.id || user?.id;
      
      const requestData = {
        ...formData,
        managerId,
        dateSubmitted: new Date().toISOString() // Add the missing dateSubmitted property
      };
      
      const result = await maintenanceService.create(requestData);
      
      // Refresh maintenance data after adding new request
      const updatedRequests = await maintenanceService.getAll(managerId);
      setMaintenanceRequests(updatedRequests);
      
      return true;
    } catch (error) {
      console.error("Error adding maintenance request:", error);
      toast({
        title: "Failed to submit maintenance request",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  const filtered = getFilteredRequests();
  const sorted = sortedRequests();
  const openRequests = sorted.filter(r => r.status === "pending" || r.status === "in-progress");
  const closedRequests = sorted.filter(r => r.status === "completed" || r.status === "cancelled");

  return {
    maintenanceRequests,
    isLoading,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    sortedRequests: sorted,
    openRequests,
    closedRequests,
    toggleSort,
    getTenantName,
    getPropertyName,
    handleAddRequest
  };
}
