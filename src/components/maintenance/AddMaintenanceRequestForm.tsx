
import { useState, useEffect } from "react";
import { Wrench, AlertTriangle } from "lucide-react";
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
import { Maintenance, Property, Tenant } from "@/types";

interface AddMaintenanceRequestFormProps {
  onSuccess: () => void;
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
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('manager_id', managerId);
        
        if (propertiesError) throw propertiesError;
        
        // Fetch tenants
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*');
        
        if (tenantsError) throw tenantsError;
        
        // Map database results to our model with proper type casting
        setProperties(propertiesData.map(item => ({
          id: item.id,
          name: item.name,
          address: item.address,
          city: item.city,
          state: item.state,
          zipCode: item.zip_code,
          units: item.units,
          type: item.type as 'apartment' | 'house' | 'duplex' | 'commercial', // Add type casting here
          image: item.image,
          managerId: item.manager_id
        })));
        
        setTenants(tenantsData.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          propertyId: item.property_id,
          unitNumber: item.unit_number,
          status: item.status as 'active' | 'inactive' | 'pending', // Add type casting here
          rentAmount: item.rent_amount,
          depositAmount: item.deposit_amount,
          balance: item.balance,
          leaseStart: item.lease_start,
          leaseEnd: item.lease_end
        })));
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
      
      // Create maintenance request in Supabase
      const { data, error } = await supabase
        .from('maintenance')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            property_id: formData.propertyId,
            tenant_id: formData.tenantId || null,
            date_submitted: formData.dateSubmitted
          }
        ])
        .select();
      
      if (error) throw error;
      
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
    </div>
  );
};

export default AddMaintenanceRequestForm;
