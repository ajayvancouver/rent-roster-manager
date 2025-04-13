
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tenant } from "@/types";
import { tenantsService } from "@/services/supabaseService";

interface UseTenantFormProps {
  onSuccess: (tenantData: Omit<Tenant, "id">) => void;
}

export const useTenantForm = ({ onSuccess }: UseTenantFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Tenant, "id">>({
    name: "",
    email: "",
    phone: "",
    propertyId: "",
    unitNumber: "",
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    rentAmount: 0,
    depositAmount: 0,
    balance: 0,
    status: "active"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["rentAmount", "depositAmount", "balance"].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "status" ? value as Tenant["status"] : value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // First check if a tenant with this email already exists
      const { data: existingTenants } = await tenantsService.checkEmailExists(formData.email);
      
      if (existingTenants && existingTenants.length > 0) {
        toast({
          title: "Email already in use",
          description: "A tenant with this email already exists.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Prepare the data - convert empty propertyId to null
      const submitData = {
        ...formData,
        propertyId: formData.propertyId ? formData.propertyId : null
      };
      
      // Use the actual Supabase service to create the tenant
      const newTenant = await tenantsService.create(submitData);
      
      toast({
        title: "Tenant added!",
        description: `${formData.name} has been added successfully.`
      });
      
      onSuccess(formData);
    } catch (error) {
      console.error("Error adding tenant:", error);
      toast({
        title: "Failed to add tenant",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
