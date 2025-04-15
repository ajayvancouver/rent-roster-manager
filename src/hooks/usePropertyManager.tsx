import { useState, useEffect, useCallback } from "react";
import { loadAllData } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";
import { useAuth } from "@/hooks/useAuth"; // Update import path

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
      if (!user || userType !== "manager") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const managerId = profile?.id || user.id;
        console.log("Fetching data with managerId:", managerId);
        
        const data = await loadAllData(managerId);
        
        // Check if properties were fetched successfully
        if (data.properties) {
          setProperties(data.properties);
          console.log(`Loaded ${data.properties.length} properties successfully`);
        }
        
        // Check if tenants were fetched successfully
        if (data.tenants) {
          setTenants(data.tenants);
          console.log(`Loaded ${data.tenants.length} tenants successfully`);
        }
        
        // Set other data, even if some parts had errors
        setPayments(data.payments || []);
        setMaintenance(data.maintenance || []);
        
        // Handle possible document error
        setDocuments(data.documents || []);
        
        // Only set error if the entire request fails
        setError(null);
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
