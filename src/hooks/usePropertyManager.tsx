
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";
import { useAuth } from "@/hooks/useAuth";
import { useDataFetching } from "@/hooks/useDataFetching";

export function usePropertyManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchData, isLoading: dataIsLoading, error: dataError } = useDataFetching();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?.id) {
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }
        
        const result = await fetchData(user.id);
        
        if (result) {
          setProperties(result.properties || []);
          setTenants(result.tenants || []);
          setPayments(result.payments || []);
          setMaintenance(result.maintenance || []);
          setDocuments(result.documents || []);
        }
      } catch (err) {
        console.error("Error in usePropertyManager:", err);
        setError(err);
        
        // Show error toast only if it's not already shown by the fetchData function
        if (!dataError) {
          toast({
            title: "Error",
            description: "Failed to load property management data. Please try again later.",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, fetchData, refreshTrigger, toast, dataError]);

  // Calculate useful statistics
  const stats = getDashboardStats(payments, tenants, properties, maintenance);
  
  // Return the combined loading and error states
  const combinedIsLoading = isLoading || dataIsLoading;
  const combinedError = error || dataError;

  return {
    properties,
    tenants,
    payments,
    maintenance,
    documents,
    isLoading: combinedIsLoading,
    error: combinedError,
    stats,
    refreshData
  };
}
