import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Home, Map, Calendar, CreditCard, Info, RefreshCw, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { linkTenantToUser } from "@/services/linkTenantToUser";

const TenantProperty: React.FC = () => {
  const { isLoading, propertyData, leaseStart, leaseEnd, rentAmount, depositAmount } = useTenantPortal();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [linkingAttempted, setLinkingAttempted] = useState(false);

  useEffect(() => {
    // Auto-check for property assignment issues when the component loads
    if (!isLoading && !propertyData && user && profile?.email && !linkingAttempted) {
      console.log("No property found, automatically checking property assignment");
      checkTenantRecords();
    }
    
    if (!isLoading && !propertyData && user) {
      toast({
        title: "No Property Assigned",
        description: "You don't have a property assigned to your account. Please contact your property manager.",
        variant: "destructive",
      });
    }
  }, [isLoading, propertyData, user, toast, profile?.email, linkingAttempted]);

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

  const checkTenantRecords = async () => {
    if (!profile?.email || !user?.id) return;
    
    setIsChecking(true);
    setLinkingAttempted(true);
    try {
      console.log("Checking tenant records for user ID:", user.id, "email:", profile.email);
      
      // First check if the user already has a tenant record
      const { data: tenantByUserId, error: userIdError } = await supabase
        .from('tenants')
        .select('*, properties(*)')
        .eq('tenant_user_id', user.id)
        .maybeSingle();
        
      if (userIdError) console.error("Error checking tenant by user ID:", userIdError);
      
      // If found by user ID, update the debug info and return
      if (tenantByUserId) {
        console.log("Found tenant record by user ID:", tenantByUserId);
        setDebugInfo({
          userId: user.id,
          userEmail: profile.email,
          tenantRecord: tenantByUserId,
          lookupMethod: "user_id",
          timestamp: new Date().toISOString()
        });
        
        // Update profile with tenant data if not already set
        if (!profile.property_id) {
          await updateProfileWithTenantData(user.id, tenantByUserId);
        }
        
        setIsChecking(false);
        return;
      }
      
      // If not found by user ID, try email match
      const { data: tenantByEmail, error: emailError } = await supabase
        .from('tenants')
        .select('*, properties(*)')
        .eq('email', profile.email)
        .maybeSingle();
        
      if (emailError) console.error("Error checking tenant by email:", emailError);
      
      // Set debug info for transparency
      setDebugInfo({
        userId: user.id,
        userEmail: profile.email,
        tenantRecordByEmail: tenantByEmail,
        lookupMethod: "email",
        timestamp: new Date().toISOString()
      });
      
      // If found by email, link the tenant to this user
      if (tenantByEmail) {
        console.log("Found tenant with email match:", tenantByEmail);
        
        if (!tenantByEmail.tenant_user_id) {
          console.log("Linking tenant to user - tenant ID:", tenantByEmail.id, "user ID:", user.id);
          
          // Link user to tenant
          try {
            await linkTenantToUser(tenantByEmail.id, user.id);
            await updateProfileWithTenantData(user.id, tenantByEmail);
            
            toast({
              title: "Success",
              description: "Property assignment linked to your account. Please refresh the page to see your property details.",
              variant: "default",
            });
          } catch (linkError) {
            console.error("Error linking tenant to user:", linkError);
            toast({
              title: "Error",
              description: "Failed to link your account to the tenant record. Please contact support.",
              variant: "destructive",
            });
          }
        } else if (tenantByEmail.tenant_user_id !== user.id) {
          // Tenant is already linked to another user - this shouldn't happen now
          console.log("Tenant is already linked to another user:", tenantByEmail.tenant_user_id);
          toast({
            title: "Account Conflict",
            description: "This tenant is already linked to another user account. Please contact your property manager.",
            variant: "destructive",
          });
        } else {
          // Tenant is correctly linked, but profile data might be missing
          console.log("Tenant is already linked to this user, updating profile data");
          await updateProfileWithTenantData(user.id, tenantByEmail);
          
          toast({
            title: "Information",
            description: "Your account is already linked to this tenant record. Try refreshing the page.",
            variant: "default",
          });
        }
      } else {
        console.log("No tenant record found for this user:", user.id);
        toast({
          title: "No Tenant Record Found",
          description: "No tenant record was found for your account. Please contact your property manager.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking tenant records:", error);
      toast({
        title: "Error",
        description: "An error occurred while checking tenant records. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const updateProfileWithTenantData = async (userId: string, tenantData: any) => {
    try {
      console.log("Updating profile with tenant data:", tenantData);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          property_id: tenantData.property_id,
          unit_number: tenantData.unit_number,
          rent_amount: tenantData.rent_amount,
          deposit_amount: tenantData.deposit_amount,
          balance: tenantData.balance,
          lease_start: tenantData.lease_start,
          lease_end: tenantData.lease_end
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error updating profile with tenant data:", profileError);
        throw profileError;
      }
      
      console.log("Successfully updated profile with tenant data");
      return true;
    } catch (error) {
      console.error("Error in updateProfileWithTenantData:", error);
      throw error;
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
        <Card className="py-8">
          <CardContent>
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Property Assigned</h2>
              <p className="text-muted-foreground mb-6">
                You don't have a property assigned to your account yet.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3 max-w-md mx-auto mb-6">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-amber-800 text-sm">Account Information</h3>
                  <p className="text-amber-700 text-sm">
                    Email: {user?.email}<br />
                    User Type: {profile?.user_type || 'tenant'}<br />
                    Account ID: {user?.id?.substring(0, 8) || 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4 items-center">
                <Button 
                  variant="default" 
                  onClick={checkTenantRecords}
                  disabled={isChecking}
                  className="mb-4"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking Property Assignment...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Link My Account to Property
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mb-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
              
              {debugInfo && (
                <div className="mt-6 p-4 border rounded text-xs bg-slate-50 text-left overflow-x-auto">
                  <p className="font-medium mb-1">Debug Info:</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
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
