
import React from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface LeaseInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const LeaseInfoFields: React.FC<LeaseInfoFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="leaseStart"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Lease Start Date</FormLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="date"
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
          name="leaseEnd"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Lease End Date</FormLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="date"
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="rentAmount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Monthly Rent ($)</FormLabel>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Monthly rent"
                    className="pl-9"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
          name="depositAmount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Security Deposit ($)</FormLabel>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Security deposit"
                    className="pl-9"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    required
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
