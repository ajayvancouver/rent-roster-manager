
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tenant } from "@/types";

interface TenantStatusFieldProps {
  status: Tenant['status'];
  onStatusChange: (value: Tenant['status']) => void;
}

export const TenantStatusField: React.FC<TenantStatusFieldProps> = ({
  status,
  onStatusChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Tenant Status</Label>
      <Select 
        value={status} 
        onValueChange={(value) => onStatusChange(value as Tenant["status"])}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
