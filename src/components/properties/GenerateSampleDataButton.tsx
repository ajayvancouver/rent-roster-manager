
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSampleProperties, connectSampleTenantsToProperties } from "@/services/sampleProperties";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface GenerateSampleDataButtonProps {
  onSuccess: () => void;
}

const GenerateSampleDataButton = ({ onSuccess }: GenerateSampleDataButtonProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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

  const handleClearSampleData = async () => {
    const managerId = profile?.id || user?.id;
    
    if (!managerId) {
      toast({
        title: "Error",
        description: "You must be logged in to clear sample data",
        variant: "destructive"
      });
      return;
    }
    
    setIsClearing(true);
    
    try {
      // Clear sample data by deleting properties which will cascade to tenants, payments, etc.
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('manager_id', managerId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample data has been cleared successfully",
      });
      
      // Trigger a refresh of the properties list
      onSuccess();
    } catch (error) {
      console.error("Error clearing sample data:", error);
      toast({
        title: "Error",
        description: "Failed to clear sample data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleGenerateSampleData}
        disabled={isLoading || isClearing}
        className="gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <PlusCircle className="h-4 w-4" />
        Generate Sample Data
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleClearSampleData}
        disabled={isLoading || isClearing}
        className="gap-2 text-destructive hover:text-destructive"
      >
        {isClearing && <Loader2 className="h-4 w-4 animate-spin" />}
        <Trash2 className="h-4 w-4" />
        Clear Sample Data
      </Button>
    </div>
  );
};

export default GenerateSampleDataButton;
