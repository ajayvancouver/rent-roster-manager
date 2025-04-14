
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
          // First attempt - try to get the tenant record by user_id
          console.log("Looking up tenant record by user_id:", user.id);
          const { data: tenantData, error: tenantLookupError } = await supabase
            .from('tenants')
            .select('*, properties(*)')
            .eq('tenant_user_id', user.id)
            .maybeSingle();
            
          if (tenantLookupError) {
            console.error("Error looking up tenant by user_id:", tenantLookupError);
          } else if (tenantData) {
            console.log("Found tenant data directly by user_id:", tenantData);
            
            // Set property data from tenant record
            if (tenantData.properties) {
              console.log("Setting property data from tenant record:", tenantData.properties);
              setPropertyData({
                ...tenantData.properties,
                unitNumber: tenantData.unit_number || null
              });
              
              // Update profile with this property data if it's missing
              if (!profile.property_id) {
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
                  console.log("Updated profile with property data from tenant record");
                }
              }
            }
          } else {
            // Second attempt - try to find the tenant by email
            console.log("No tenant record found by user_id, trying email lookup:", profile.email);
            
            if (profile.email) {
              const { data: tenantByEmail, error: emailLookupError } = await supabase
                .from('tenants')
                .select('*, properties(*)')
                .eq('email', profile.email)
                .maybeSingle();
                
              if (emailLookupError) {
                console.error("Error looking up tenant by email:", emailLookupError);
              } else if (tenantByEmail) {
                console.log("Found tenant data by email:", tenantByEmail);
                
                // Link this tenant to the user account
                const { error: linkError } = await supabase
                  .from('tenants')
                  .update({ tenant_user_id: user.id })
                  .eq('id', tenantByEmail.id);
                  
                if (linkError) {
                  console.error("Error linking tenant to user:", linkError);
                } else {
                  console.log("Linked tenant to user account");
                }
                
                // Set property data
                if (tenantByEmail.properties) {
                  console.log("Setting property data from tenant email lookup:", tenantByEmail.properties);
                  setPropertyData({
                    ...tenantByEmail.properties,
                    unitNumber: tenantByEmail.unit_number || null
                  });
                  
                  // Update profile with this property information
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                      property_id: tenantByEmail.property_id,
                      unit_number: tenantByEmail.unit_number,
                      rent_amount: tenantByEmail.rent_amount,
                      deposit_amount: tenantByEmail.deposit_amount,
                      balance: tenantByEmail.balance,
                      lease_start: tenantByEmail.lease_start,
                      lease_end: tenantByEmail.lease_end
                    })
                    .eq('id', user.id);
                    
                  if (updateError) {
                    console.error("Error updating profile with property data:", updateError);
                  } else {
                    console.log("Updated profile with property data from email lookup");
                  }
                }
              } else {
                // Third attempt - try direct property lookup from profile
                console.log("No tenant record found by email. Checking if profile has property_id:", profile.property_id);
                
                if (profile.property_id) {
                  const { data: property, error: propertyError } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', profile.property_id)
                    .maybeSingle();
                  
                  if (propertyError) {
                    console.error("Error fetching property:", propertyError);
                  } else if (property) {
                    console.log("Property found from profile.property_id:", property);
                    setPropertyData({
                      ...property,
                      unitNumber: profile.unit_number || null
                    });
                  } else {
                    console.log("No property found with ID:", profile.property_id);
                  }
                } else {
                  console.log("No property_id in profile and no tenant record found by email or user_id");
                }
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
