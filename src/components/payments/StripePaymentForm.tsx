
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StripePaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
}

const StripePaymentForm = ({
  amount,
  onSuccess,
  onError,
  clientSecret,
  paymentIntentId,
  paymentId
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/tenant/payments`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        toast({
          title: "Payment failed",
          description: stripeError.message || "An error occurred during payment processing",
          variant: "destructive",
        });
        
        if (onError) onError(stripeError.message || "Payment failed");
        return;
      }

      // If we get here, the payment succeeded or requires no further action
      // Update the payment status in our database
      const { error: updateError } = await supabase.functions.invoke("update-payment-status", {
        body: { paymentIntentId, paymentId },
      });

      if (updateError) {
        console.error("Error updating payment status:", updateError);
      }

      toast({
        title: "Payment successful",
        description: `Your payment of $${amount.toFixed(2)} has been processed`,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred during payment processing",
        variant: "destructive",
      });
      
      if (onError) onError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing 
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
