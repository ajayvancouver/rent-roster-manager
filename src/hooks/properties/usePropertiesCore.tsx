
import { useState, useEffect, useCallback } from "react";
import { Property } from "@/types";
import { propertiesService } from "@/services/propertiesService";
import { tenantsService } from "@/services/tenantsService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function usePropertiesCore() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const managerId = profile?.id || user?.id;
      
      console.log("Fetching properties with managerId:", managerId);
      console.log("Current user info:", { userId: user?.id, profileId: profile?.id });
      
      let allProperties: Property[] = [];
      
      if (!managerId) {
        console.warn("No manager ID available, attempting to fetch all properties");
        allProperties = await propertiesService.getAll();
        console.log("All properties (no filter):", allProperties);
      }
      
      const [fetchedProperties, fetchedTenants] = await Promise.all([
        managerId ? propertiesService.getAll(managerId) : allProperties,
        tenantsService.getAll(managerId)
      ]);
      
      console.log("Fetched properties:", fetchedProperties);
      console.log("Fetched tenants:", fetchedTenants);
      
      if (fetchedProperties.length === 0) {
        console.warn("No properties found for this manager ID");
      }
      
      setProperties(fetchedProperties);
      setTenants(fetchedTenants);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching properties data:", error);
      setError("Failed to load properties data");
      toast({
        title: "Error",
        description: "Failed to load properties data",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [toast, user, profile]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const getFilteredProperties = () => {
    const searchTerms = searchQuery.toLowerCase();
    return properties.filter(property => (
      property.name.toLowerCase().includes(searchTerms) ||
      property.address.toLowerCase().includes(searchTerms) ||
      property.city.toLowerCase().includes(searchTerms)
    ));
  };

  return {
    properties,
    setProperties,
    tenants,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    filteredProperties: getFilteredProperties(),
    fetchProperties
  };
}
