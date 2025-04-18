
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
      
      // Try the services approach first
      try {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, address, city, state, zip_code, units, type, image, manager_id');
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw new Error(`Properties error: ${propertiesError.message}`);
        }
        
        const properties = transformProperties(propertiesData || []);
        
        // Fetch tenants
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*');
        
        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error(`Tenants error: ${tenantsError.message}`);
        }
        
        const tenants = transformTenants(tenantsData || [], properties);
        
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          throw new Error(`Payments error: ${paymentsError.message}`);
        }
        
        const payments = transformPayments(paymentsData || [], tenants);
        
        // Fetch maintenance
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('*');
        
        if (maintenanceError) {
          console.error("Error fetching maintenance:", maintenanceError);
          throw new Error(`Maintenance error: ${maintenanceError.message}`);
        }
        
        const maintenance = transformMaintenance(maintenanceData || [], properties, tenants);
        
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*');
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          throw new Error(`Documents error: ${documentsError.message}`);
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
        // If service approach fails, try to use the supabaseService directly
        console.warn("Service approach failed, trying direct service:", serviceError);
        
        try {
          const { loadAllData } = await import("@/services/supabaseService");
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
