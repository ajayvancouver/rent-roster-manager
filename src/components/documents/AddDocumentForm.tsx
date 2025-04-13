
import { useState } from "react";
import { File, FolderOpen, Calendar, Building2, User } from "lucide-react";
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
import { Document } from "@/types";
import { properties, tenants } from "@/data/mockData";

interface AddDocumentFormProps {
  onSuccess: () => void;
}

const AddDocumentForm = ({ onSuccess }: AddDocumentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Document, "id" | "uploadDate" | "fileSize" | "fileType">>({
    name: "",
    type: "lease",
    url: "",
    propertyId: "",
    tenantId: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
      [field]: field === "type" ? value as Document["type"] : value
    }));
  };

  const filteredTenants = formData.propertyId 
    ? tenants.filter(tenant => tenant.propertyId === formData.propertyId)
    : [];

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Submitting document:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Document added!",
        description: "The document has been added successfully."
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Failed to add document",
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
        <Label htmlFor="name">Document Title</Label>
        <div className="relative">
          <File className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Enter document title"
            className="pl-9"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Document Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => handleSelectChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lease">Lease Agreement</SelectItem>
            <SelectItem value="payment">Payment Receipt</SelectItem>
            <SelectItem value="maintenance">Maintenance Record</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyId">Related Property (Optional)</Label>
        <Select 
          value={formData.propertyId} 
          onValueChange={(value) => handleSelectChange("propertyId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenantId">Related Tenant (Optional)</Label>
        <Select 
          value={formData.tenantId} 
          onValueChange={(value) => handleSelectChange("tenantId", value)}
          disabled={!formData.propertyId && formData.tenantId === ""}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.propertyId ? "Select tenant" : "Select property first (optional)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {filteredTenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Document URL</Label>
        <div className="relative">
          <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="url"
            name="url"
            placeholder="Enter document URL"
            className="pl-9"
            value={formData.url}
            onChange={handleChange}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a URL to the document. In a real app, this would be a file upload.
        </p>
      </div>
    </div>
  );
};

export default AddDocumentForm;
