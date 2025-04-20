
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Property, Tenant, Payment, Maintenance, Document } from "@/types";
import { transformProperties, transformTenants, transformPayments, transformMaintenance, transformDocuments } from "@/utils/transformData";

interface FetchDataResult {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  maintenance: Maintenance[];
  documents: Document[];
}

export function useDataFetching() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async (userId?: string): Promise<FetchDataResult | null> => {
    if (!userId) {
      setError("You must be logged in to view this data");
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching data as user:", userId);
      
      // Direct approach - using separate queries with specific column selection
      try {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, address, city, state, zip_code, units, type, image, manager_id');
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw new Error(`Properties error: ${propertiesError.message}`);
        }
        
        const properties = transformProperties(propertiesData || []);
        
        // Fetch tenants with limited columns
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, name, email, phone, property_id, unit_number, lease_start, lease_end, rent_amount, deposit_amount, balance, status, tenant_user_id');
        
        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error(`Tenants error: ${tenantsError.message}`);
        }
        
        const tenants = transformTenants(tenantsData || [], properties);
        
        // Fetch payments with limited columns
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('id, tenant_id, amount, date, method, status, notes');
        
        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          throw new Error(`Payments error: ${paymentsError.message}`);
        }
        
        const payments = transformPayments(paymentsData || [], tenants);
        
        // Fetch maintenance with limited columns
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('id, property_id, tenant_id, title, description, priority, status, date_submitted, date_completed, assigned_to, cost');
        
        if (maintenanceError) {
          console.error("Error fetching maintenance:", maintenanceError);
          throw new Error(`Maintenance error: ${maintenanceError.message}`);
        }
        
        const maintenance = transformMaintenance(maintenanceData || [], properties, tenants);
        
        // Fetch documents with limited columns
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id, name, type, tenant_id, property_id, upload_date, file_size, file_type, url');
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          // Continue even if documents fail, consider it non-critical
          console.warn("Continuing without documents due to error");
        }
        
        const documents = transformDocuments(documentsData || [], properties, tenants);
        
        return {
          properties,
          tenants,
          payments,
          maintenance,
          documents
        };
      } catch (serviceError) {
        // If direct query approach fails, try the supabaseService
        console.warn("Direct query approach failed, trying supabaseService:", serviceError);
        
        try {
          // Using dynamic import to avoid circular dependencies
          const { loadAllData } = await import("@/services/supabaseService");
          console.log("Falling back to loadAllData with userId:", userId);
          const result = await loadAllData(userId);
          
          if (result.error) {
            throw result.error;
          }
          
          return {
            properties: result.properties || [],
            tenants: result.tenants || [],
            payments: result.payments || [],
            maintenance: result.maintenance || [],
            documents: result.documents || []
          };
        } catch (fallbackError) {
          console.error("Both approaches failed:", fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load application data. Please try again later.",
        variant: "destructive"
      });
      return {
        properties: [],
        tenants: [],
        payments: [],
        maintenance: [],
        documents: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    fetchData,
    isLoading,
    error
  };
}
