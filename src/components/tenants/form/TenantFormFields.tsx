
import React from "react";
import { User, Mail, Phone, Building2, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tenant } from "@/types";
import { properties } from "@/data/mockData";

interface TenantFormFieldsProps {
  formData: Omit<Tenant, "id">;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
}

export const TenantFormFields: React.FC<TenantFormFieldsProps> = ({
  formData,
  handleChange,
  handleSelectChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tenant Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Enter tenant name"
            className="pl-9"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              className="pl-9"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              placeholder="Phone number"
              className="pl-9"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyId">Property</Label>
        <Select 
          value={formData.propertyId} 
          onValueChange={(value) => handleSelectChange("propertyId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit Number (Optional)</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="unitNumber"
            name="unitNumber"
            placeholder="Unit number"
            className="pl-9"
            value={formData.unitNumber}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};
