import { useState, useEffect, useCallback } from "react";
import { Property } from "@/types";
import { propertiesService } from "@/services/propertiesService";
import { tenantsService } from "@/services/tenantsService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useProperties() {
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
      
      // Get the manager ID from either the profile or user object
      const managerId = profile?.id || user?.id;
      
      console.log("Fetching properties with managerId:", managerId);
      console.log("Current user info:", { userId: user?.id, profileId: profile?.id });
      
      // Attempt to fetch properties without a manager filter if we don't have a manager ID
      // This is for debugging purposes to see if properties exist at all
      let allProperties: Property[] = [];
      
      if (!managerId) {
        console.warn("No manager ID available, attempting to fetch all properties");
        allProperties = await propertiesService.getAll();
        console.log("All properties (no filter):", allProperties);
      }
      
      // Fetch properties filtered by manager ID
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

  // Filter properties
  const getFilteredProperties = () => {
    const searchTerms = searchQuery.toLowerCase();
    return properties.filter(property => (
      property.name.toLowerCase().includes(searchTerms) ||
      property.address.toLowerCase().includes(searchTerms) ||
      property.city.toLowerCase().includes(searchTerms)
    ));
  };

  // Get tenant count for a property
  const getTenantCount = (propertyId: string) => {
    return tenants.filter(tenant => tenant.propertyId === propertyId).length;
  };

  // Get vacancy count for a property
  const getVacancyCount = (property: Property) => {
    const occupiedUnits = getTenantCount(property.id);
    return property.units - occupiedUnits;
  };

  // Get property type icon name
  const getPropertyTypeIcon = (type: Property["type"]) => {
    return type;
  };

  // Calculate occupancy rate for a property
  const getOccupancyRate = (property: Property) => {
    const tenantCount = getTenantCount(property.id);
    return property.units > 0 ? Math.round((tenantCount / property.units) * 100) : 0;
  };

  // Calculate overall occupancy rate
  const getOverallOccupancyRate = () => {
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const totalTenants = tenants.length;
    return totalUnits > 0 ? Math.round((totalTenants / totalUnits) * 100) : 0;
  };

  // Add property
  const handleAddProperty = async (formData: Omit<Property, "id">) => {
    try {
      setIsLoading(true);
      // Ensure managerId is set
      const managerId = profile?.id || user?.id;
      const propertyData = {
        ...formData,
        managerId
      };
      
      const result = await propertiesService.create(propertyData);
      
      // Add the new property to the local state
      if (result) {
        setProperties(prevProperties => [...prevProperties, result]);
        
        toast({
          title: "Property added!",
          description: `${formData.name} has been added successfully.`
        });
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Failed to add property",
        description: "Please try again later.",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // Update property
  const handleUpdateProperty = async (id: string, formData: Partial<Omit<Property, "id">>) => {
    try {
      const result = await propertiesService.update(id, formData);
      
      if (result) {
        // Update the property in local state
        setProperties(prevProperties => 
          prevProperties.map(property => 
            property.id === id ? { ...property, ...formData } : property
          )
        );
        
        toast({
          title: "Success",
          description: "Property has been updated successfully."
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Failed to update property",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: string) => {
    try {
      // Check if there are tenants linked to this property
      const propertyTenants = tenants.filter(tenant => tenant.propertyId === id);
      
      if (propertyTenants.length > 0) {
        toast({
          title: "Cannot delete property",
          description: `This property has ${propertyTenants.length} tenants. Remove all tenants before deleting.`,
          variant: "destructive"
        });
        return false;
      }
      
      const success = await propertiesService.delete(id);
      
      if (success) {
        // Remove the property from local state
        setProperties(prevProperties => prevProperties.filter(property => property.id !== id));
        
        toast({
          title: "Success",
          description: "Property has been deleted successfully."
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Failed to delete property",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    properties,
    tenants,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    filteredProperties: getFilteredProperties(),
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate,
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty,
    fetchProperties
  };
}
