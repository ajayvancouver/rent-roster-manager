
import React from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tenant } from "@/types";

interface LeaseInfoFieldsProps {
  formData: Omit<Tenant, "id">;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LeaseInfoFields: React.FC<LeaseInfoFieldsProps> = ({
  formData,
  handleChange
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaseStart">Lease Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="leaseStart"
              name="leaseStart"
              type="date"
              className="pl-9"
              value={formData.leaseStart}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseEnd">Lease End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="leaseEnd"
              name="leaseEnd"
              type="date"
              className="pl-9"
              value={formData.leaseEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rentAmount">Monthly Rent ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="rentAmount"
              name="rentAmount"
              type="number"
              min="0"
              placeholder="Monthly rent"
              className="pl-9"
              value={formData.rentAmount || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositAmount">Security Deposit ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="depositAmount"
              name="depositAmount"
              type="number"
              min="0"
              placeholder="Security deposit"
              className="pl-9"
              value={formData.depositAmount || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};
