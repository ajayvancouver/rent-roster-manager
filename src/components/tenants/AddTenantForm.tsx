import React from "react";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { TenantFormFields } from "./form/TenantFormFields";
import { LeaseInfoFields } from "./form/LeaseInfoFields";
import { TenantStatusField } from "./form/TenantStatusField";
import { useAuth } from "@/contexts";

const tenantFormSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  propertyId: z.string().optional(),
  unitNumber: z.string().optional(),
  leaseStart: z.string(),
  leaseEnd: z.string(),
  rentAmount: z.coerce.number().min(0, "Rent amount cannot be negative"),
  depositAmount: z.coerce.number().min(0, "Deposit amount cannot be negative"),
  balance: z.coerce.number().optional(),
  status: z.enum(["active", "inactive", "pending"]),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface AddTenantFormProps {
  onSuccess: (tenantData: Omit<Tenant, "id">) => void;
}

const AddTenantForm = ({ onSuccess }: AddTenantFormProps) => {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
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
    }
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsProcessing(true);
    try {
      const managerId = profile?.id || user?.id;
      const tenantData = {
        ...data,
        managerId
      };
      
      await onSuccess(tenantData as Omit<Tenant, "id">);
      form.reset();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TenantFormFields form={form} />
        
        <LeaseInfoFields form={form} />
        
        <TenantStatusField form={form} />
        
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Adding..." : "Add Tenant"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddTenantForm;
