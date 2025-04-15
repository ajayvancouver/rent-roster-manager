import { useState, useEffect } from "react";
import { Calendar, DollarSign } from "lucide-react";
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
import { Payment } from "@/types";
import { tenantsService } from "@/services/supabaseService";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";

interface AddPaymentFormProps {
  onSuccess: () => void;
}

const AddPaymentForm = ({ onSuccess }: AddPaymentFormProps) => {
  const { toast } = useToast();
  const { handleAddPayment } = usePayments();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<Omit<Payment, "id" | "tenantName" | "propertyId" | "propertyName" | "unitNumber">>({
    tenantId: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: "cash",
    status: "completed",
    notes: ""
  });

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const managerId = profile?.id || user?.id;
        console.log("Fetching tenants for manager:", managerId);
        const data = await tenantsService.getAll(managerId);
        console.log("Tenants fetched for dropdown:", data);
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        toast({
          title: "Error",
          description: "Failed to load tenants data",
          variant: "destructive"
        });
      }
    };
    
    fetchTenants();
  }, [toast, user, profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.tenantId) {
      toast({
        title: "Error",
        description: "Please select a tenant",
        variant: "destructive"
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Payment amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Submitting payment form with data:", formData);
      const success = await handleAddPayment(formData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId">Tenant</Label>
        <Select 
          value={formData.tenantId} 
          onValueChange={(value) => handleSelectChange("tenantId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Payment Amount ($)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            className="pl-9"
            value={formData.amount || ""}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Payment Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="date"
            name="date"
            type="date"
            className="pl-9"
            value={formData.date}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select 
          value={formData.method} 
          onValueChange={(value) => handleSelectChange("method", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="bank transfer">Bank Transfer</SelectItem>
            <SelectItem value="credit card">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange("status", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Enter any additional notes"
          rows={3}
          value={formData.notes || ""}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <Button 
        type="button" 
        className="w-full" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Recording Payment..." : "Record Payment"}
      </Button>
    </div>
  );
};

export default AddPaymentForm;
