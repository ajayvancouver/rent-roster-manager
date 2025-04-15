import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSampleProperties, connectSampleTenantsToProperties } from "@/services/sampleProperties";
import { useAuth } from "@/contexts";

interface GenerateSampleDataButtonProps {
  onSuccess: () => void;
}

// This component is no longer being used in the app
// Keeping the file for reference in case it's needed later
const GenerateSampleDataButton = ({ onSuccess }: GenerateSampleDataButtonProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSampleData = async () => {
    const managerId = profile?.id || user?.id;
    
    if (!managerId) {
      toast({
        title: "Error",
        description: "You must be logged in to generate sample data",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create sample properties
      const propertyIds = await createSampleProperties(managerId);
      
      // Connect existing tenants to the new properties
      await connectSampleTenantsToProperties(managerId, propertyIds);
      
      toast({
        title: "Success",
        description: "Sample properties have been added successfully",
      });
      
      // Trigger a refresh of the properties list
      onSuccess();
    } catch (error) {
      console.error("Error generating sample data:", error);
      toast({
        title: "Error",
        description: "Failed to generate sample data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGenerateSampleData}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <PlusCircle className="h-4 w-4" />
      Generate Sample Data
    </Button>
  );
};

export default GenerateSampleDataButton;
