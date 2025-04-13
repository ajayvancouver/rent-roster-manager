
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tenant } from "@/types";
import { tenantsService } from "@/services/tenantsService";
import { useAuth } from "@/contexts/AuthContext";

interface UseTenantFormProps {
  onSuccess: (tenantData: Omit<Tenant, "id" | "propertyName" | "propertyAddress">) => void;
}

export const useTenantForm = ({ onSuccess }: UseTenantFormProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const managerId = profile?.id || user?.id;
  
  const [formData, setFormData] = useState<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>({
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
    status: "active",
    managerId: managerId
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
      // Validate form data
      if (!formData.name) {
        toast({
          title: "Name is required",
          description: "Please enter a tenant name.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (!formData.email) {
        toast({
          title: "Email is required",
          description: "Please enter a tenant email.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Check if a tenant with this email already exists
      const { data: existingTenants, error: emailCheckError } = await tenantsService.checkEmailExists(formData.email);
      
      if (emailCheckError) {
        console.error("Error checking email:", emailCheckError);
        toast({
          title: "Error checking email",
          description: "Could not verify if email is already in use.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (existingTenants && existingTenants.length > 0) {
        toast({
          title: "Email already in use",
          description: "A tenant with this email already exists.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Prepare the data with proper null handling and ensure managerId is present
      const submitData = {
        ...formData,
        propertyId: formData.propertyId || "",
        unitNumber: formData.unitNumber || "",
        managerId: managerId
      };
      
      console.log("Submitting tenant data:", submitData);
      
      onSuccess(submitData);
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
