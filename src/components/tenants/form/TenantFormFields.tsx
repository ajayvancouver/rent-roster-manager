
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";

interface TenantFormFieldsProps {
  form: UseFormReturn<any>;
  properties: any[];
  isEditMode: boolean;
  isLoading: boolean;
}

const TenantFormFields: React.FC<TenantFormFieldsProps> = ({ form, properties, isEditMode, isLoading }) => {
  const { user, profile } = useAuth();
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="Enter full name" 
            {...form.register("name", { required: "Name is required" })} 
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{String(form.formState.errors.name.message)}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email" 
            {...form.register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format"
              }
            })}
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{String(form.formState.errors.email.message)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input 
            id="phone" 
            placeholder="Enter phone number" 
            {...form.register("phone")}
            disabled={isLoading}
          />
        </div>

        {/* Property */}
        <div className="space-y-2">
          <Label htmlFor="propertyId">Property</Label>
          <Select 
            onValueChange={(value: string) => form.setValue("propertyId", value)}
            defaultValue={form.getValues("propertyId")}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.propertyId && (
            <p className="text-sm text-red-500">{String(form.formState.errors.propertyId.message)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Unit Number */}
        <div className="space-y-2">
          <Label htmlFor="unitNumber">Unit Number</Label>
          <Input 
            id="unitNumber" 
            placeholder="Enter unit number" 
            {...form.register("unitNumber")}
            disabled={isLoading}
          />
        </div>

        {/* Rent Amount */}
        <div className="space-y-2">
          <Label htmlFor="rentAmount">Rent Amount</Label>
          <Input 
            id="rentAmount" 
            type="number" 
            placeholder="Enter rent amount" 
            {...form.register("rentAmount", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Lease Start Date */}
        <div className="space-y-2">
          <Label htmlFor="leaseStart">Lease Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="leaseStart"
              placeholder="Lease start date"
              type="date"
              className="pl-10"
              {...form.register("leaseStart")}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Lease End Date */}
        <div className="space-y-2">
          <Label htmlFor="leaseEnd">Lease End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="leaseEnd"
              placeholder="Lease end date"
              type="date"
              className="pl-10"
              {...form.register("leaseEnd")}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Deposit Amount */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="depositAmount">Deposit Amount</Label>
        <Input 
          id="depositAmount" 
          type="number" 
          placeholder="Enter deposit amount" 
          {...form.register("depositAmount", { valueAsNumber: true })}
          disabled={isLoading}
        />
      </div>

      {/* Balance */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="balance">Balance</Label>
        <Input 
          id="balance" 
          type="number" 
          placeholder="Enter balance" 
          {...form.register("balance", { valueAsNumber: true })}
          disabled={isLoading}
        />
      </div>

      {/* Notes */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          placeholder="Enter any notes" 
          rows={3}
          {...form.register("notes")}
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default TenantFormFields;
