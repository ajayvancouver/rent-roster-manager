
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import PaymentOptions from "./PaymentOptions";

interface MakePaymentButtonProps {
  amount?: number;
  onPaymentComplete?: () => void;
}

const MakePaymentButton = ({ amount = 0, onPaymentComplete }: MakePaymentButtonProps) => {
  const [open, setOpen] = useState(false);

  const handlePaymentComplete = () => {
    setOpen(false);
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <CreditCard className="h-4 w-4" />
        Make a Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method.
            </DialogDescription>
          </DialogHeader>
          
          <PaymentOptions 
            amount={amount} 
            onPaymentComplete={handlePaymentComplete} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MakePaymentButton;
