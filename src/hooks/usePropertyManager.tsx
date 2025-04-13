
import { useState, useEffect } from "react";
import { loadAllData } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";

// This hook provides access to all the data across the application
export function usePropertyManager() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadAllData();
        
        setProperties(data.properties);
        setTenants(data.tenants);
        setPayments(data.payments);
        setMaintenance(data.maintenance);
        setDocuments(data.documents);
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
  }, [toast]);

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
    stats
  };
}
