
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tenant } from "@/types";

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
      // In a real app, this would be an API call
      console.log("Submitting tenant:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
