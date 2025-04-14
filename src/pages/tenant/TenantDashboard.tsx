
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CreditCard, Wrench, FileText, AlertTriangle } from "lucide-react";
import { format, isAfter, parseISO, addMonths } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";

const TenantDashboard: React.FC = () => {
  const { 
    isLoading, 
    propertyData, 
    maintenanceRequests, 
    payments, 
    documents,
    totalPaid,
    rentAmount,
    balance,
    leaseEnd
  } = useTenantPortal();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isLeaseExpiringSoon = () => {
    if (!leaseEnd) return false;
    try {
      const endDate = parseISO(leaseEnd);
      const warningDate = addMonths(new Date(), 1);
      return isAfter(warningDate, endDate);
    } catch (error) {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your tenant portal</p>
      </div>

      {isLeaseExpiringSoon() && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Lease Expiring Soon</h3>
            <p className="text-amber-700 text-sm">Your lease will expire on {formatDate(leaseEnd)}. Contact your property manager to discuss renewal options.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-primary" />
              <div>
                <p className="font-semibold">{propertyData?.name || 'Not assigned'}</p>
                {propertyData?.unitNumber && (
                  <p className="text-xs text-muted-foreground">Unit {propertyData.unitNumber}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/tenant/property">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rent Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-primary" />
              <div>
                <p className={`font-semibold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Monthly Rent: {formatCurrency(rentAmount)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/tenant/payments">View Payments</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wrench className="h-6 w-6 mr-2 text-primary" />
              <div>
                <p className="font-semibold">{maintenanceRequests.length} Requests</p>
                <p className="text-xs text-muted-foreground">
                  {maintenanceRequests.filter(req => req.status !== 'completed').length} Active
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/tenant/maintenance">View Requests</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-primary" />
              <div>
                <p className="font-semibold">{documents.length} Documents</p>
                <p className="text-xs text-muted-foreground">
                  {documents.filter(doc => doc.type === 'lease').length} Lease Documents
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/tenant/documents">View Documents</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceRequests.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No maintenance requests found</p>
            ) : (
              <div className="space-y-4">
                {maintenanceRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {formatDate(request.date_submitted)}
                      </p>
                    </div>
                    <Badge className={
                      request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      request.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      'bg-blue-100 text-blue-800'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/tenant/maintenance">View All Maintenance Requests</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No payment records found</p>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.date)} - {payment.method}
                      </p>
                    </div>
                    <Badge className={
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/tenant/payments">View All Payments</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;
