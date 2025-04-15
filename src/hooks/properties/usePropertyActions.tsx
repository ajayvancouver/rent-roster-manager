
import { useState } from "react";
import { Property } from "@/types";
import { propertiesService } from "@/services/propertiesService";
import { maintenanceService } from "@/services/maintenanceService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function usePropertyActions(
  properties: Property[],
  tenants: any[],
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>,
  fetchProperties: () => Promise<void>
) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProperty = async (formData: Omit<Property, "id">) => {
    try {
      setIsLoading(true);
      const managerId = profile?.id || user?.id;
      const propertyData = {
        ...formData,
        managerId
      };
      
      const result = await propertiesService.create(propertyData);
      
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

  const handleUpdateProperty = async (id: string, formData: Partial<Omit<Property, "id">>) => {
    try {
      const result = await propertiesService.update(id, formData);
      
      if (result) {
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

  const handleDeleteProperty = async (id: string) => {
    try {
      const propertyTenants = tenants.filter(tenant => tenant.propertyId === id);
      
      if (propertyTenants.length > 0) {
        toast({
          title: "Cannot delete property",
          description: `This property has ${propertyTenants.length} tenants. Remove all tenants before deleting.`,
          variant: "destructive"
        });
        return false;
      }
      
      try {
        const maintenanceRequests = await maintenanceService.getByPropertyId(id);
        if (maintenanceRequests.length > 0) {
          toast({
            title: "Cannot delete property",
            description: `This property has ${maintenanceRequests.length} maintenance requests. Address all maintenance requests before deleting.`,
            variant: "destructive"
          });
          return false;
        }
      } catch (error) {
        console.error("Error checking maintenance requests:", error);
      }
      
      const success = await propertiesService.delete(id);
      
      if (success) {
        setProperties(prevProperties => prevProperties.filter(property => property.id !== id));
        
        toast({
          title: "Success",
          description: "Property has been deleted successfully."
        });
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again later.",
        variant: "destructive"
      });
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
    isLoading,
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty
  };
}
