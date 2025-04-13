
import { useState } from "react";
import { File, FileText, Calendar, User, Building2 } from "lucide-react";
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
  
  const [formData, setFormData] = useState<Omit<Document, "id" | "fileSize" | "fileType">>({
    name: "",
    type: "lease",
    tenantId: undefined,
    propertyId: undefined,
    uploadDate: new Date().toISOString(),
    url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (value === "") {
      // Handle clearing a selection
      const newFormData = { ...formData };
      if (field in newFormData) {
        delete newFormData[field as keyof typeof newFormData];
      }
      setFormData(newFormData as typeof formData);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      console.log("File selected:", file);
      // Create a dummy URL for demo purposes
      setFormData(prev => ({
        ...prev,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        fileType: file.type.split('/')[1],
        url: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Submitting document:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Document added!",
        description: `${formData.name} has been uploaded successfully.`
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Failed to upload document",
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
        <Label htmlFor="name">Document Name</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Enter document name"
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
            <SelectItem value="lease">Lease</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyId">Related Property (Optional)</Label>
        <Select 
          value={formData.propertyId || ""} 
          onValueChange={(value) => handleSelectChange("propertyId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
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
          value={formData.tenantId || ""}
          onValueChange={(value) => handleSelectChange("tenantId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {tenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload Document</Label>
        <Input
          id="file"
          type="file"
          className="cursor-pointer"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: PDF, DOC, DOCX, JPG, PNG
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Document URL (Optional)</Label>
        <div className="relative">
          <File className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="url"
            name="url"
            placeholder="External document URL"
            className="pl-9"
            value={formData.url}
            onChange={handleChange}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          For linking to externally hosted documents
        </p>
      </div>
    </div>
  );
};

export default AddDocumentForm;
