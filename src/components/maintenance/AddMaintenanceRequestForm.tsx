
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Maintenance, Property, Tenant } from "@/types";
import { propertiesService } from "@/services/propertiesService";
import { tenantsService } from "@/services/tenantsService";

interface AddMaintenanceRequestFormProps {
  onSuccess: (formData: any) => void;
}

const AddMaintenanceRequestForm = ({ onSuccess }: AddMaintenanceRequestFormProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<Omit<Maintenance, "id" | "dateCompleted" | "assignedTo" | "cost">>({
    propertyId: "",
    tenantId: "",
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dateSubmitted: new Date().toISOString(),
  });

  // Fetch properties and tenants from the database
  useEffect(() => {
    const fetchData = async () => {
      const managerId = profile?.id || user?.id;
      
      if (!managerId) {
        setLoadingData(false);
        return;
      }
      
      try {
        // Use our services to fetch properties and tenants
        const fetchedProperties = await propertiesService.getAll(managerId);
        const fetchedTenants = await tenantsService.getAll(managerId);
        
        setProperties(fetchedProperties);
        setTenants(fetchedTenants);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load properties and tenants. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user, profile, toast]);

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
    // Add validation to ensure required fields are filled
    if (!formData.propertyId || !formData.title || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const managerId = profile?.id || user?.id;
      
      if (!managerId) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a maintenance request",
          variant: "destructive"
        });
        return;
      }
      
      // Call the onSuccess function with the form data
      // This will trigger the parent component's handleAddRequestSuccess function
      onSuccess(formData);
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
          disabled={loadingData}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingData ? "Loading properties..." : "Select property"} />
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
          disabled={!formData.propertyId || loadingData}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              loadingData 
                ? "Loading tenants..." 
                : formData.propertyId 
                  ? filteredTenants.length > 0 
                    ? "Select tenant" 
                    : "No tenants for this property" 
                  : "Select property first"
            } />
          </SelectTrigger>
          <SelectContent>
            {filteredTenants.length > 0 ? 
              filteredTenants.map(tenant => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              )) : 
              <SelectItem value="no-tenants" disabled>
                No tenants found for this property
              </SelectItem>
            }
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

      <Button 
        type="button" 
        className="w-full mt-4" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit Request"}
      </Button>
    </div>
  );
};

export default AddMaintenanceRequestForm;
