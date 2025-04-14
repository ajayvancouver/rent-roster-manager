
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

  useEffect(() => {
    const loadTenantData = async () => {
      if (authLoading || !user || !profile) {
        return;
      }

      setIsLoading(true);
      try {
        if (profile.user_type === 'tenant') {
          // Fetch tenant property data
          if (profile.property_id) {
            const { data: property, error: propertyError } = await supabase
              .from('properties')
              .select('*')
              .eq('id', profile.property_id)
              .single();
            
            if (propertyError) throw propertyError;
            setPropertyData({
              ...property,
              unitNumber: profile.unit_number || null
            });
          }

          // Fetch maintenance requests
          const { data: maintenance, error: maintenanceError } = await supabase
            .from('maintenance')
            .select('*')
            .eq('tenant_user_id', user.id)
            .order('date_submitted', { ascending: false });

          if (maintenanceError) throw maintenanceError;
          setMaintenanceRequests(maintenance || []);

          // Fetch payments
          const { data: paymentData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('tenant_user_id', user.id)
            .order('date', { ascending: false });

          if (paymentsError) throw paymentsError;
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

          if (documentsError) throw documentsError;
          setDocuments(documentData || []);
        }
      } catch (error) {
        console.error("Error loading tenant data:", error);
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
  };
}
