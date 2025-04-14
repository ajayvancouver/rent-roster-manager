
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId?: string;
  propertyId?: string;
  onSuccess: () => void;
}

const MaintenanceRequestForm = ({ 
  open, 
  onOpenChange, 
  profileId, 
  propertyId, 
  onSuccess 
}: MaintenanceRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileId || !propertyId) {
      toast({
        title: "Error",
        description: "Missing property or tenant information",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('maintenance').insert({
        tenant_user_id: profileId,
        property_id: propertyId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'pending'
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
      
      onOpenChange(false);
      onSuccess();
      
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Maintenance Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="e.g., Leaking faucet"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description"
              placeholder="Please provide details about the issue..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Emergency - Requires immediate attention</SelectItem>
                <SelectItem value="high">High - Needs to be fixed ASAP</SelectItem>
                <SelectItem value="medium">Medium - Standard priority</SelectItem>
                <SelectItem value="low">Low - Can be addressed when convenient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceRequestForm;
