
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";
import { useAuth } from "@/hooks/useAuth";

// This hook provides access to all the data across the application
export function usePropertyManager() {
  const { toast } = useToast();
  const { user, userType, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        setError("You must be logged in to view this data");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Authenticated user ID:", user.id);
        console.log("User type:", userType);
        console.log("Profile:", profile);
        
        // Fetch properties (RLS will filter to only show properties managed by the current user)
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*');
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw propertiesError;
        }
        
        console.log("Properties fetched:", propertiesData?.length || 0);
        setProperties(propertiesData || []);
        
        // Fetch tenants (RLS will filter based on property management)
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*, properties(name, address, city, state, zip_code)');
        
        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw tenantsError;
        }
        
        console.log("Tenants fetched:", tenantsData?.length || 0);
        
        // Transform tenant data to match our application model
        const transformedTenants = (tenantsData || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone || '',
          propertyId: tenant.property_id || '',
          propertyName: tenant.properties ? tenant.properties.name : null,
          propertyAddress: tenant.properties ? 
            `${tenant.properties.address}, ${tenant.properties.city}, ${tenant.properties.state} ${tenant.properties.zip_code}` : 
            null,
          unitNumber: tenant.unit_number || '',
          leaseStart: tenant.lease_start,
          leaseEnd: tenant.lease_end,
          rentAmount: tenant.rent_amount,
          depositAmount: tenant.deposit_amount,
          balance: tenant.balance || 0,
          status: tenant.status as 'active' | 'inactive' | 'pending',
          userId: tenant.tenant_user_id,
          managerId: null // We'll get this from the property
        }));
        
        setTenants(transformedTenants);
        
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          throw paymentsError;
        }
        
        console.log("Payments fetched:", paymentsData?.length || 0);
        setPayments(paymentsData || []);
        
        // Fetch maintenance requests
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('*');
        
        if (maintenanceError) {
          console.error("Error fetching maintenance requests:", maintenanceError);
          throw maintenanceError;
        }
        
        console.log("Maintenance requests fetched:", maintenanceData?.length || 0);
        setMaintenance(maintenanceData || []);
        
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*');
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          throw documentsError;
        }
        
        console.log("Documents fetched:", documentsData?.length || 0);
        setDocuments(documentsData || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching property manager data:", error);
        setError(error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load application data. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [user, userType, profile, toast, refreshTrigger]);

  // Calculate useful statistics
  const stats = getDashboardStats(payments, tenants, properties, maintenance);

  return {
    properties,
    tenants,
    payments,
    maintenance,
    documents,
    isLoading,
    error,
    stats,
    refreshData
  };
}
