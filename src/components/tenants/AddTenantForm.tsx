
import React from "react";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/types";
import { TenantFormFields } from "./form/TenantFormFields";
import { LeaseInfoFields } from "./form/LeaseInfoFields";
import { TenantStatusField } from "./form/TenantStatusField";
import { useTenantForm } from "./form/useTenantForm";

interface AddTenantFormProps {
  onSuccess: (tenantData: Omit<Tenant, "id">) => void;
}

const AddTenantForm = ({ onSuccess }: AddTenantFormProps) => {
  const {
    formData,
    isLoading,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useTenantForm({ onSuccess });

  return (
    <div className="space-y-4">
      <TenantFormFields 
        formData={formData} 
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <LeaseInfoFields 
        formData={formData}
        handleChange={handleChange}
      />
      
      <TenantStatusField 
        status={formData.status}
        onStatusChange={(value) => handleSelectChange("status", value)}
      />
      
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Tenant"}
        </Button>
      </div>
    </div>
  );
};

export default AddTenantForm;
