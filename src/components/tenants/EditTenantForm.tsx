
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tenant } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { propertiesService } from "@/services/propertiesService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TenantFormFields from "./form/TenantFormFields";
import LeaseInfoFields from "./form/LeaseInfoFields";
import TenantStatusField from "./form/TenantStatusField";

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

interface EditTenantFormProps {
  tenant: Tenant;
  onSubmit: (values: TenantFormValues) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const EditTenantForm = ({ tenant, onSubmit, onCancel, isProcessing = false }: EditTenantFormProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      propertyId: tenant.propertyId,
      unitNumber: tenant.unitNumber,
      leaseStart: tenant.leaseStart,
      leaseEnd: tenant.leaseEnd,
      rentAmount: tenant.rentAmount,
      depositAmount: tenant.depositAmount,
      balance: tenant.balance,
      status: tenant.status,
    },
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const managerId = tenant.managerId;
        const data = await propertiesService.getAll(managerId);
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    };
    
    fetchProperties();
  }, [tenant.managerId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <TenantFormFields 
            form={form} 
            properties={properties} 
            isLoadingProperties={isLoadingProperties} 
          />
          
          <LeaseInfoFields form={form} />
          
          <TenantStatusField form={form} />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EditTenantForm;
