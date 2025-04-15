import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { tenantsService } from "@/services/tenantsService";
import { propertiesService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";

export function useTenantData() {
  const { user, userType, profile } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const managerId = profile?.id || user.id;
        
        const [fetchedTenants, fetchedProperties] = await Promise.all([
          tenantsService.getAll(managerId),
          propertiesService.getAll(managerId)
        ]);
        
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tenant data:", error);
        toast({
          title: "Error",
          description: "Failed to load tenants and properties",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, userType, profile, toast]);

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
