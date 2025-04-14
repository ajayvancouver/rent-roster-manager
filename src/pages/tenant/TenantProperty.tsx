
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Home, Map, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";

const TenantProperty: React.FC = () => {
  const { isLoading, propertyData, leaseStart, leaseEnd, rentAmount, depositAmount } = useTenantPortal();

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

  const getPropertyTypeIcon = () => {
    if (!propertyData) return <Building2 className="h-8 w-8 text-primary" />;
    
    switch (propertyData.type) {
      case 'house': return <Home className="h-8 w-8 text-primary" />;
      case 'apartment': return <Building2 className="h-8 w-8 text-primary" />;
      case 'duplex': return <Building2 className="h-8 w-8 text-primary" />;
      default: return <Building2 className="h-8 w-8 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Property</h1>
          <p className="text-muted-foreground mt-2">Your property information</p>
        </div>
        <Card className="py-12">
          <CardContent>
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Property Assigned</h2>
              <p className="text-muted-foreground">
                You don't have a property assigned to your account yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Property</h1>
        <p className="text-muted-foreground mt-2">Your property information</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          {getPropertyTypeIcon()}
          <CardTitle>{propertyData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Address</h4>
            <div className="flex items-start space-x-2">
              <Map className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p>{propertyData.address}, {propertyData.city}, {propertyData.state} {propertyData.zipCode}</p>
            </div>
            {propertyData.unitNumber && (
              <p className="ml-7 mt-1">Unit {propertyData.unitNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Lease Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(leaseStart)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate(leaseEnd)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Financial Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">{formatCurrency(rentAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">{formatCurrency(depositAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Property Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-medium capitalize">{propertyData.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Units in Building</p>
                <p className="font-medium">{propertyData.units}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantProperty;
