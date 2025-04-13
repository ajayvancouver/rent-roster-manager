
import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { tenantsService, propertiesService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useTenantData() {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || userType !== "manager") {
        setIsLoading(false);
        return;
      }
      
      try {
        const [fetchedTenants, fetchedProperties] = await Promise.all([
          tenantsService.getAll(),
          propertiesService.getAll()
        ]);
        
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tenants and properties",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, userType, toast]);

  const getPropertyName = (propertyId: string) => {
    if (!propertyId) return "Unassigned";
    
    // First check if the tenant has the property name already from the join
    const tenant = tenants.find(t => t.propertyId === propertyId && t.propertyName);
    if (tenant?.propertyName) return tenant.propertyName;
    
    // Fallback to searching in properties
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown Property";
  };

  return {
    tenants,
    setTenants,
    properties,
    isLoading,
    getPropertyName
  };
}
