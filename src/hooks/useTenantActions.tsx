
import { useState } from "react";
import { Tenant } from "@/types";
import { tenantsService } from "@/services/tenantsService";
import { useToast } from "@/hooks/use-toast";
import { linkTenantToUser } from "@/services/linkTenantToUser"; 

export function useTenantActions(tenants: Tenant[], setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>, properties: any[]) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddTenant = async (tenantData: Omit<Tenant, "id" | "propertyName" | "propertyAddress">) => {
    try {
      setIsProcessing(true);
      
      // Remove managerId from tenant data since it's a property of properties, not tenants
      const { managerId, ...tenantWithoutManagerId } = tenantData;
      
      const { data, error } = await tenantsService.create(tenantWithoutManagerId);
      
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
          status: data.status as 'active' | 'inactive' | 'pending',
          managerId: tenantData.managerId // Keep the managerId from the original data
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
        
        // Check if the tenant has a user account with the same email
        if (tenantData.email) {
          try {
            const { data: users } = await tenantsService.findUserByEmail(tenantData.email);
            if (users && users.length > 0) {
              // If a user with this email exists, link the tenant to the user
              const userId = users[0].id;
              await linkTenantToUser(newTenant.id, userId);
            }
          } catch (linkError) {
            console.error("Error linking tenant to user:", linkError);
            // Don't fail the tenant creation if linking fails
          }
        }
        
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
