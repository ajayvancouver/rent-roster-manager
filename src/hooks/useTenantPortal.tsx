
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { tenantsService } from "@/services/tenantsService";

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
  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    const loadTenantData = async () => {
      if (authLoading || !user) {
        return;
      }

      setIsLoading(true);
      setLoadingError(null);
      
      try {
        console.log("Loading tenant data for user:", user.id);
        
        // First try to get tenant by user ID
        let tenant = null;
        
        try {
          tenant = await tenantsService.getTenantByUserId(user.id);
          console.log("Tenant data by user ID:", tenant);
        } catch (error) {
          console.log("Error fetching tenant by user ID, will try email lookup:", error);
        }
        
        // If no tenant found by user ID, try by email
        if (!tenant && profile?.email) {
          console.log("Looking up tenant by email:", profile.email);
          
          try {
            const { data } = await supabase
              .from('tenants')
              .select('*, properties(*)')
              .ilike('email', profile.email)
              .maybeSingle();
            
            if (data) {
              console.log("Found tenant by email:", data);
              tenant = data;
              
              // Link the tenant to the user
              const { error: linkError } = await supabase
                .from('tenants')
                .update({ tenant_user_id: user.id })
                .eq('id', data.id);
                
              if (linkError) {
                console.error("Failed to link tenant to user:", linkError);
              } else {
                console.log("Successfully linked tenant to user");
              }
            }
          } catch (error) {
            console.error("Error looking up tenant by email:", error);
          }
        }
        
        // If we found tenant data, use it
        if (tenant) {
          setTenantData(tenant);
          
          // Set property data
          if (tenant.properties) {
            console.log("Setting property data:", tenant.properties);
            setPropertyData({
              ...tenant.properties,
              unitNumber: tenant.unit_number || null
            });
          } else if (tenant.propertyId) {
            // If tenant has propertyId but properties not populated, fetch property data
            console.log("Fetching property data for ID:", tenant.propertyId);
            try {
              const { data: propertyData } = await supabase
                .from('properties')
                .select('*')
                .eq('id', tenant.propertyId)
                .single();
                
              if (propertyData) {
                console.log("Found property data:", propertyData);
                setPropertyData({
                  ...propertyData,
                  unitNumber: tenant.unitNumber || null
                });
              }
            } catch (error) {
              console.error("Error fetching property data:", error);
            }
          }
          
          // Set rental/financial info
          if (tenant.rentAmount) setTotalDue(tenant.balance || 0);
          
          // Fetch maintenance requests
          try {
            const { data: maintenance } = await supabase
              .from('maintenance')
              .select('*')
              .eq('tenant_id', tenant.id)
              .order('date_submitted', { ascending: false });
              
            setMaintenanceRequests(maintenance || []);
          } catch (error) {
            console.error("Error fetching maintenance requests:", error);
          }
          
          // Fetch payments
          try {
            const { data: paymentData } = await supabase
              .from('payments')
              .select('*')
              .eq('tenant_id', tenant.id)
              .order('date', { ascending: false });
              
            setPayments(paymentData || []);
            
            // Calculate total paid
            const paid = (paymentData || []).reduce((sum: number, payment: any) => {
              if (payment.status === 'completed') {
                return sum + Number(payment.amount);
              }
              return sum;
            }, 0);
            
            setTotalPaid(paid);
          } catch (error) {
            console.error("Error fetching payments:", error);
          }
          
          // Fetch documents
          try {
            const { data: documentData } = await supabase
              .from('documents')
              .select('*')
              .eq('tenant_id', tenant.id)
              .order('upload_date', { ascending: false });
              
            setDocuments(documentData || []);
          } catch (error) {
            console.error("Error fetching documents:", error);
          }
        } else {
          console.log("No tenant data found for this user");
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
    leaseStart: tenantData?.lease_start || null,
    leaseEnd: tenantData?.lease_end || null,
    rentAmount: tenantData?.rent_amount || 0,
    depositAmount: tenantData?.deposit_amount || 0,
    balance: tenantData?.balance || 0,
    error: loadingError,
    tenantData
  };
}
