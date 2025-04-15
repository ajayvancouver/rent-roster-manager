import { useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import { useAuth } from "@/contexts";

interface AddPropertyFormProps {
  onSuccess: (formData: Omit<Property, "id">) => Promise<void>;
}

const AddPropertyForm = ({ onSuccess }: AddPropertyFormProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    units: 1,
    type: "apartment",
    image: undefined,
    managerId: profile?.id || user?.id
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "units" ? parseInt(value) || 0 : value
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as Property["type"]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSuccess(formData);
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Failed to add property",
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
        <Label htmlFor="name">Property Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Enter property name"
            className="pl-9"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="address"
            name="address"
            placeholder="Enter street address"
            className="pl-9"
            value={formData.address}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="units">Number of Units</Label>
          <Input
            id="units"
            name="units"
            type="number"
            min="1"
            placeholder="Number of units"
            value={formData.units}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Property Type</Label>
        <Select 
          name="type" 
          value={formData.type} 
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="duplex">Duplex</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL (Optional)</Label>
        <Input
          id="image"
          name="image"
          placeholder="Image URL"
          value={formData.image || ""}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <Button 
        type="button" 
        className="w-full mt-4" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Adding Property..." : "Add Property"}
      </Button>
    </div>
  );
};

export default AddPropertyForm;
