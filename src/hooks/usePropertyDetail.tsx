
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types";
import { propertiesService, tenantsService } from "@/services/supabaseService";

export const usePropertyDetail = (id: string | undefined, cachedProperties: Property[] = [], cachedTenants: any[] = []) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Property ID is missing",
          variant: "destructive"
        });
        navigate('/properties');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Looking for property with ID:", id);
        
        // First try to find the property in the already loaded properties
        if (cachedProperties && cachedProperties.length > 0) {
          console.log("Available properties:", cachedProperties);
          const foundProperty = cachedProperties.find(p => p.id === id);
          
          if (foundProperty) {
            console.log("Found property in cache:", foundProperty);
            setProperty(foundProperty);
            
            // Filter tenants for this property from already loaded tenants
            if (cachedTenants && cachedTenants.length > 0) {
              const propertyTenants = cachedTenants.filter(tenant => tenant.propertyId === id);
              console.log("Filtered tenants:", propertyTenants);
              setTenants(propertyTenants);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // If not found in the cached properties, fetch from the API
        console.log("Fetching property from API with ID:", id);
        const fetchedProperty = await propertiesService.getById(id);
        console.log("API response for property:", fetchedProperty);
        
        if (!fetchedProperty) {
          console.error("No property found with ID:", id);
          toast({
            title: "Property not found",
            description: "The property you are looking for does not exist",
            variant: "destructive"
          });
          navigate('/properties');
          return;
        }
        
        setProperty(fetchedProperty);
        
        // Fetch tenants for this property
        console.log("Fetching tenants for property:", id);
        const allTenantsData = await tenantsService.getAll();
        const filteredTenants = allTenantsData.filter(tenant => tenant.propertyId === id);
        console.log("Filtered tenants from API:", filteredTenants);
        setTenants(filteredTenants);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive"
        });
        setIsLoading(false);
        navigate('/properties');
      }
    };
    
    fetchPropertyDetails();
  }, [id, toast, navigate, cachedProperties, cachedTenants]);

  // Calculate occupancy rate
  const occupancyRate = property && property.units > 0 
    ? Math.round((tenants.length / property.units) * 100) 
    : 0;

  return {
    property,
    tenants,
    isLoading,
    occupancyRate
  };
};
