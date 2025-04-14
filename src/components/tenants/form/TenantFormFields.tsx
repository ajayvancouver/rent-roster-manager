
import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Property } from "@/types";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { propertiesService } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { UseFormReturn } from "react-hook-form";

interface TenantFormFieldsProps {
  form: UseFormReturn<any>;
  properties?: Property[];
  isLoadingProperties?: boolean;
}

export const TenantFormFields: React.FC<TenantFormFieldsProps> = ({
  form,
  properties: propProperties,
  isLoadingProperties: propIsLoading
}) => {
  const [properties, setProperties] = useState<Property[]>(propProperties || []);
  const [isLoading, setIsLoading] = useState(propIsLoading || true);
  const { profile, user } = useAuth();
  
  useEffect(() => {
    // If properties are provided externally, use those
    if (propProperties) {
      setProperties(propProperties);
      setIsLoading(propIsLoading || false);
      return;
    }

    const fetchProperties = async () => {
      try {
        const managerId = profile?.id || user?.id;
        const data = await propertiesService.getAll(managerId);
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [profile, user, propProperties, propIsLoading]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Tenant Name</FormLabel>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder="Enter tenant name"
                  className="pl-9"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-9"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Phone</FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Phone number"
                    className="pl-9"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="propertyId"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Property</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                ) : properties.length === 0 ? (
                  <SelectItem value="none" disabled>No properties found</SelectItem>
                ) : (
                  properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}, {property.city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="unitNumber"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Unit Number (Optional)</FormLabel>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder="Unit number"
                  className="pl-9"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
