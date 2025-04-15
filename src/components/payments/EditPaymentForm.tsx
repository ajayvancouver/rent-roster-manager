
import { useState } from "react";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditPaymentFormProps {
  payment: Payment;
  onSubmit: (data: Partial<Payment>) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

const EditPaymentForm = ({
  payment,
  onSubmit,
  onCancel,
  isProcessing,
}: EditPaymentFormProps) => {
  const [formData, setFormData] = useState({
    amount: payment.amount,
    date: new Date(payment.date),
    method: payment.method,
    status: payment.status,
    notes: payment.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      date: formData.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            className="pl-7"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Payment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select
          defaultValue={formData.method}
          onValueChange={(value) => handleSelectChange("method", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a payment method" />
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
          defaultValue={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this payment"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditPaymentForm;
