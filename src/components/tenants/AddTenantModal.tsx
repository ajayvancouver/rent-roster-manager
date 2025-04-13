
import React from "react";
import { Tenant } from "@/types";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddTenantForm from "@/components/tenants/AddTenantForm";

interface AddTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTenant: (tenantData: Omit<Tenant, "id">) => Promise<boolean>;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({
  open,
  onOpenChange,
  onAddTenant
}) => {
  const handleSuccess = async (tenantData: Omit<Tenant, "id">) => {
    const success = await onAddTenant(tenantData);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AddEntityModal
      title="Add New Tenant"
      open={open}
      onOpenChange={onOpenChange}
      onSave={() => {
        // This is a no-op function to satisfy the type requirement
        // The actual saving is done by AddTenantForm's onSuccess prop
      }}
    >
      <AddTenantForm onSuccess={handleSuccess} />
    </AddEntityModal>
  );
};

export default AddTenantModal;
