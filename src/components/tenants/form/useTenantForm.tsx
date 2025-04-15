import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tenant } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { tenantsService } from '@/services/tenantsService';
import { propertiesService } from '@/services/supabaseService';
import { useAuth } from "@/contexts";

const tenantFormSchema = z.object({
  name: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  propertyId: z.string().min(1, { message: "Please select a property." }),
  unitNumber: z.string().optional(),
  leaseStart: z.string().optional(),
  leaseEnd: z.string().optional(),
  rentAmount: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
    message: "Rent amount must be a number greater than zero."
  }),
  depositAmount: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "Deposit amount must be a number greater than or equal to zero."
  }).optional(),
  balance: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Balance must be a number."
  }).optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface UseTenantFormProps {
  initialValues?: Partial<TenantFormValues>;
  onSubmit: (values: TenantFormValues) => Promise<boolean>;
  managerId: string | undefined;
}

export const useTenantForm = ({ initialValues, onSubmit, managerId }: UseTenantFormProps) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      propertyId: initialValues?.propertyId || "",
      unitNumber: initialValues?.unitNumber || "",
      leaseStart: initialValues?.leaseStart || "",
      leaseEnd: initialValues?.leaseEnd || "",
      rentAmount: initialValues?.rentAmount || "0",
      depositAmount: initialValues?.depositAmount || "0",
      balance: initialValues?.balance || "0",
      status: initialValues?.status || "pending",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      if (!managerId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const fetchedProperties = await propertiesService.getAll(managerId);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [managerId, toast]);

  const handleSubmit = async (values: TenantFormValues) => {
    try {
      const success = await onSubmit({
        ...values,
      });

      if (success) {
        form.reset();
      }
      
      return success;
    } catch (error) {
      console.error("Form submission error:", error);
      return false;
    }
  };

  return {
    form,
    properties,
    isLoading,
    handleSubmit,
  };
};
