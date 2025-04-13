
import { useState } from "react";
import { Calendar, Banknote, FileText, DollarSign } from "lucide-react";
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
import { tenants } from "@/data/mockData";

interface AddPaymentFormProps {
  onSuccess: () => void;
}

const AddPaymentForm = ({ onSuccess }: AddPaymentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Payment, "id">>({
    tenantId: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: "cash",
    status: "completed",
    notes: ""
  });

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
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Recording payment:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Payment recorded!",
        description: `Payment of $${formData.amount} has been recorded successfully.`
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Failed to record payment",
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
        <Label htmlFor="tenantId">Tenant</Label>
        <Select 
          value={formData.tenantId} 
          onValueChange={(value) => handleSelectChange("tenantId", value)}
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
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select 
          value={formData.method} 
          onValueChange={(value) => handleSelectChange("method", value)}
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
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
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
        />
      </div>
    </div>
  );
};

export default AddPaymentForm;
