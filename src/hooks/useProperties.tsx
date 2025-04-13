
import { useState, useEffect } from "react";
import { Property } from "@/types";
import { propertiesService, tenantsService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

export function useProperties() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProperties, fetchedTenants] = await Promise.all([
          propertiesService.getAll(),
          tenantsService.getAll()
        ]);
        
        setProperties(fetchedProperties);
        setTenants(fetchedTenants);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching properties data:", error);
        toast({
          title: "Error",
          description: "Failed to load properties data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  // Add property (we'll implement this in AddPropertyForm)
  const handleAddProperty = async (formData: Omit<Property, "id">) => {
    try {
      const result = await propertiesService.create(formData);
      
      // Refresh properties data after adding new property
      const updatedProperties = await propertiesService.getAll();
      setProperties(updatedProperties);
      
      return true;
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Failed to add property",
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
    handleAddProperty
  };
}
