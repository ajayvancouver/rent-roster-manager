
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, CheckCircle } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51OusGOBvxCgN8hIpkkpK94Wr8rJQ9gXWsZuZM45RWLsBRG07Gl1a4fPuQEWO8Zx2dAWZMa0MYrIY19zHPaLQfG1800v3qvofNu");

interface PaymentOptionsProps {
  amount: number;
  onPaymentComplete?: () => void;
}

const PaymentOptions = ({ amount, onPaymentComplete }: PaymentOptionsProps) => {
  const { toast } = useToast();
  const [paymentTab, setPaymentTab] = useState("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Sample e-transfer information (replace with actual data from your property manager)
  const eTransferInfo = {
    email: "payments@propertymanager.com",
    name: "Property Management Inc.",
    instructions: "Please include your tenant ID and property address in the message"
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(eTransferInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initializeStripePayment = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: { amount, description: "Rent payment" },
      });

      if (error) {
        throw new Error(error.message);
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPaymentId(data.paymentId);
    } catch (error) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Payment initialization failed",
        description: "Unable to start the payment process. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteracPayment = async () => {
    setIsLoading(true);
    
    try {
      // Record the interac payment in the database
      const { data, error } = await supabase
        .from("payments")
        .insert({
          amount,
          method: "bank transfer",
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          notes: "Interac e-Transfer (pending confirmation)"
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "e-Transfer initiated",
        description: "Your e-Transfer has been recorded. Please complete the transfer using your bank's website or app.",
      });
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error("Error recording e-Transfer:", error);
      toast({
        title: "e-Transfer recording failed",
        description: "Unable to record your e-Transfer. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Select your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe" value={paymentTab} onValueChange={setPaymentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stripe">Credit Card</TabsTrigger>
            <TabsTrigger value="interac">Interac e-Transfer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe" className="mt-4">
            {!clientSecret ? (
              <div className="text-center py-4">
                <p className="mb-4">Pay your rent securely with credit or debit card</p>
                <Button 
                  onClick={initializeStripePayment} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading 
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing...</>
                    : `Pay $${amount.toFixed(2)} with Card`}
                </Button>
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm 
                  amount={amount} 
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId || ""}
                  paymentId={paymentId || ""}
                  onSuccess={onPaymentComplete}
                />
              </Elements>
            )}
          </TabsContent>
          
          <TabsContent value="interac" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>Send e-Transfer to</Label>
                <div className="flex items-center mt-1">
                  <Input 
                    value={eTransferInfo.email} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="ml-2"
                    onClick={handleCopyEmail}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Recipient Name</Label>
                <Input value={eTransferInfo.name} readOnly />
              </div>
              
              <div>
                <Label>Amount</Label>
                <Input value={`$${amount.toFixed(2)}`} readOnly />
              </div>
              
              <div>
                <Label>Instructions</Label>
                <p className="text-sm text-muted-foreground mt-1">{eTransferInfo.instructions}</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm">
                <p>After sending the e-Transfer, click the button below to record your payment. Your property manager will confirm receipt.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {paymentTab === "interac" && (
        <CardFooter>
          <Button 
            onClick={handleInteracPayment} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              : "I've Sent the e-Transfer"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PaymentOptions;
