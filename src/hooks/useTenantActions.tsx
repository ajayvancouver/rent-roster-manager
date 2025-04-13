
import { useState } from "react";
import { Tenant } from "@/types";
import { tenantsService } from "@/services/tenantsService";
import { useToast } from "@/hooks/use-toast";

export function useTenantActions(tenants: Tenant[], setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>, properties: any[]) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddTenant = async (tenantData: Omit<Tenant, "id" | "propertyName" | "propertyAddress">) => {
    try {
      setIsProcessing(true);
      const { data, error } = await tenantsService.create(tenantData);
      
      if (error) {
        console.error("Error creating tenant:", error);
        toast({
          title: "Error",
          description: "Failed to add tenant: " + error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data) {
        // Map the returned data to a Tenant object
        const newTenant: Tenant = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          propertyId: data.property_id || '',
          unitNumber: data.unit_number || '',
          leaseStart: data.lease_start,
          leaseEnd: data.lease_end,
          rentAmount: data.rent_amount,
          depositAmount: data.deposit_amount,
          balance: data.balance || 0,
          status: data.status as 'active' | 'inactive' | 'pending'
        };
        
        // Add property data if available
        if (newTenant.propertyId) {
          const property = properties.find(p => p.id === newTenant.propertyId);
          if (property) {
            newTenant.propertyName = property.name;
            newTenant.propertyAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;
          }
        }
        
        setTenants(prevTenants => [...prevTenants, newTenant]);
        
        toast({
          title: "Success",
          description: "Tenant has been added successfully."
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error adding tenant:", error);
      toast({
        title: "Error",
        description: "Failed to add tenant: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleAddTenant
  };
}
