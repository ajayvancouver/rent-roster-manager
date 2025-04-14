
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useTenantPortal() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenantData = async () => {
      if (authLoading || !user) {
        return;
      }

      setIsLoading(true);
      setLoadingError(null);
      
      try {
        // First check if the user has a profile
        if (!profile) {
          console.log("No profile data available, cannot load tenant data");
          setIsLoading(false);
          return;
        }
        
        if (profile.user_type === 'tenant') {
          // Fetch tenant property data
          if (profile.property_id) {
            console.log("Fetching property data for property ID:", profile.property_id);
            const { data: property, error: propertyError } = await supabase
              .from('properties')
              .select('*')
              .eq('id', profile.property_id)
              .maybeSingle();
            
            if (propertyError) {
              console.error("Error fetching property:", propertyError);
              throw propertyError;
            }
            
            if (property) {
              console.log("Property data found:", property);
              setPropertyData({
                ...property,
                unitNumber: profile.unit_number || null
              });
            } else {
              console.log("No property found with ID:", profile.property_id);
            }
          } else {
            console.log("No property_id in profile, checking tenants table for this user");
            
            // Check if there's a tenant record linked to this user ID
            const { data: tenantData, error: tenantError } = await supabase
              .from('tenants')
              .select('*, properties(*)')
              .eq('tenant_user_id', user.id)
              .maybeSingle();
              
            if (tenantError) {
              console.error("Error checking tenant record:", tenantError);
            } else if (tenantData && tenantData.property_id && tenantData.properties) {
              console.log("Found tenant data with property:", tenantData);
              setPropertyData({
                ...tenantData.properties,
                unitNumber: tenantData.unit_number || null
              });
              
              // Update the profile with this property information
              const { error: updateError } = await supabase
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
                .eq('id', user.id);
                
              if (updateError) {
                console.error("Error updating profile with property data:", updateError);
              } else {
                console.log("Updated profile with property data");
              }
            }
          }

          // Fetch maintenance requests
          const { data: maintenance, error: maintenanceError } = await supabase
            .from('maintenance')
            .select('*')
            .eq('tenant_user_id', user.id)
            .order('date_submitted', { ascending: false });

          if (maintenanceError) {
            console.error("Error fetching maintenance:", maintenanceError);
            throw maintenanceError;
          }
          setMaintenanceRequests(maintenance || []);

          // Fetch payments
          const { data: paymentData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('tenant_user_id', user.id)
            .order('date', { ascending: false });

          if (paymentsError) {
            console.error("Error fetching payments:", paymentsError);
            throw paymentsError;
          }
          setPayments(paymentData || []);

          // Calculate total paid
          const paid = (paymentData || []).reduce((sum: number, payment: any) => {
            if (payment.status === 'completed') {
              return sum + Number(payment.amount);
            }
            return sum;
          }, 0);
          
          setTotalPaid(paid);
          
          // Set total due from profile data
          if (profile?.rent_amount) {
            setTotalDue(profile.balance || 0);
          }

          // Fetch documents
          const { data: documentData, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .eq('tenant_user_id', user.id)
            .order('upload_date', { ascending: false });

          if (documentsError) {
            console.error("Error fetching documents:", documentsError);
            throw documentsError;
          }
          setDocuments(documentData || []);
        }
      } catch (error: any) {
        console.error("Error loading tenant data:", error);
        setLoadingError(error.message || "Failed to load tenant information");
        toast({
          title: "Error",
          description: "Failed to load your tenant information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantData();
  }, [user, profile, authLoading, toast]);

  return {
    isLoading: isLoading || authLoading,
    profile,
    propertyData,
    maintenanceRequests,
    payments,
    documents,
    totalPaid,
    totalDue,
    leaseStart: profile?.lease_start || null,
    leaseEnd: profile?.lease_end || null,
    rentAmount: profile?.rent_amount || 0,
    depositAmount: profile?.deposit_amount || 0,
    balance: profile?.balance || 0,
    error: loadingError,
  };
}
