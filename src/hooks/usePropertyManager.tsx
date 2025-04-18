
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";
import { useAuth } from "@/hooks/useAuth";
import { useDataFetching } from "@/hooks/useDataFetching";

export function usePropertyManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchData, isLoading, error } = useDataFetching();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData(user?.id);
      if (result) {
        setProperties(result.properties);
        setTenants(result.tenants);
        setPayments(result.payments);
        setMaintenance(result.maintenance);
        setDocuments(result.documents);
      }
    };

    loadData();
  }, [user, fetchData, refreshTrigger]);

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
