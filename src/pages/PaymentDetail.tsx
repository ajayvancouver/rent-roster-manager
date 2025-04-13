
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, CreditCard, User, Building, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { paymentsService } from "@/services/paymentsService";
import { Payment } from "@/types";

const PaymentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await paymentsService.getById(id);
        
        if (error) throw error;
        
        setPayment(data);
      } catch (error) {
        console.error("Error fetching payment:", error);
        toast({
          title: "Error",
          description: "Could not load payment details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/payments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <p className="text-muted-foreground">View details of a specific payment</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-4 w-full max-w-xs mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : payment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Payment #{payment.id.substring(0, 8)}</span>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Created on {formatDate(payment.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Amount</h3>
                <p className="text-3xl font-bold">${payment.amount.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{payment.method}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(payment.date)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Tenant</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{payment.tenantName}</span>
                  </div>
                </div>
                {payment.propertyName && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{payment.propertyName} {payment.unitNumber ? `Unit ${payment.unitNumber}` : ''}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {payment.notes && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p>{payment.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Receipt
              </Button>
              <Button className="w-full" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Related Payment
              </Button>
              <Button className="w-full" variant="outline">
                <User className="mr-2 h-4 w-4" />
                View Tenant
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-center text-muted-foreground">
              Payment not found. It may have been deleted or you don't have access.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/payments">Return to Payments</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentDetail;
