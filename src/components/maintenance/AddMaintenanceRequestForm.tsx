
import { useState } from "react";
import { Wrench, AlertTriangle, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Maintenance } from "@/types";
import { properties, tenants } from "@/data/mockData";

interface AddMaintenanceRequestFormProps {
  onSuccess: () => void;
}

const AddMaintenanceRequestForm = ({ onSuccess }: AddMaintenanceRequestFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Maintenance, "id" | "dateCompleted" | "assignedTo" | "cost">>({
    propertyId: "",
    tenantId: "",
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dateSubmitted: new Date().toISOString(),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredTenants = formData.propertyId 
    ? tenants.filter(tenant => tenant.propertyId === formData.propertyId)
    : [];

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Submitting maintenance request:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Maintenance request submitted!",
        description: "The request has been added successfully."
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error adding maintenance request:", error);
      toast({
        title: "Failed to submit request",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Issue Title</Label>
        <div className="relative">
          <Wrench className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="title"
            name="title"
            placeholder="Enter issue title"
            className="pl-9"
            value={formData.title}
            onChange={handleChange}
            required
          />
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
        <Label htmlFor="tenantId">Tenant</Label>
        <Select 
          value={formData.tenantId} 
          onValueChange={(value) => handleSelectChange("tenantId", value)}
          disabled={!formData.propertyId}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.propertyId ? "Select tenant" : "Select property first"} />
          </SelectTrigger>
          <SelectContent>
            {filteredTenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the issue in detail"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => handleSelectChange("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AddMaintenanceRequestForm;
