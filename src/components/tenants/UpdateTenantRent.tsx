
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateTenantRentByEmail } from "@/services/updateTenantRent";
import { Loader2 } from "lucide-react";

interface UpdateTenantRentProps {
  onSuccess: () => void;
}

const UpdateTenantRent: React.FC<UpdateTenantRentProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateAjayTenant2Rent = async () => {
    setIsUpdating(true);
    try {
      // Update Ajay Tenant 2's rent from $2000 to $1500
      await updateTenantRentByEmail("tenant2@test.com", 1500);
      
      toast({
        title: "Rent Updated",
        description: "Ajay Tenant 2's rent has been updated to $1500",
      });
      
      // Refresh the tenant list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating tenant rent:", error);
      toast({
        title: "Error",
        description: "Failed to update rent amount: " + (error.message || "Please try again"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateAjayTenant2Rent}
      disabled={isUpdating}
      variant="outline"
      className="ml-2"
    >
      {isUpdating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Fix Ajay Tenant 2 Rent"
      )}
    </Button>
  );
};

export default UpdateTenantRent;
