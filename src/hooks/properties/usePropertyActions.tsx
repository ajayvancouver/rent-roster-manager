import { useState } from "react";
import { Property, Tenant } from "@/types";
import { propertiesService } from "@/services/propertiesService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateSampleTenants } from "@/services/sampleData";
import { useAuth } from "@/contexts"; // Updated import path

export function usePropertyActions(
  properties: Property[],
  tenants: Tenant[],
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>,
  fetchProperties: () => Promise<void>
) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddProperty = async (propertyData: Omit<Property, "id" | "managerId">) => {
    try {
      setIsProcessing(true);
      
      // Ensure managerId is available
      const managerId = profile?.id || user?.id;
      if (!managerId) {
        throw new Error("Manager ID not found");
      }
      
      // Add managerId to the property data
      const propertyDataWithManagerId = {
        ...propertyData,
        managerId: managerId
      };
      
      const newProperty = await propertiesService.create(propertyDataWithManagerId);
      
      if (newProperty) {
        setProperties(prevProperties => [...prevProperties, newProperty]);
        toast({
          title: "Success",
          description: "Property has been added successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to add property. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProperty = async (id: string, propertyData: Partial<Property>) => {
    try {
      setIsProcessing(true);
      
      const updatedProperty = await propertiesService.update(id, propertyData);
      
      if (updatedProperty) {
        // Update the property in local state
        setProperties(prevProperties =>
          prevProperties.map(property =>
            property.id === id ? { ...property, ...propertyData } : property
          )
        );
        
        toast({
          title: "Success",
          description: "Property has been updated successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update property. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      setIsProcessing(true);
      
      const success = await propertiesService.delete(id);
      
      if (success) {
        // Remove the property from local state
        setProperties(prevProperties => prevProperties.filter(property => property.id !== id));
        
        toast({
          title: "Success",
          description: "Property has been deleted successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete property. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSampleData = async (propertyId: string) => {
    try {
      setIsProcessing(true);
      
      // Generate sample tenants for the property
      await generateSampleTenants(propertyId);
      
      // Refresh properties to reflect the changes
      await fetchProperties();
      
      toast({
        title: "Success",
        description: "Sample data generated successfully."
      });
    } catch (error: any) {
      console.error("Error generating sample data:", error);
      toast({
        title: "Error",
        description: "Failed to generate sample data: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty,
    handleGenerateSampleData
  };
}
