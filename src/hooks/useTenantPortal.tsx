
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loadTenantData } from "@/services/supabaseService";
import { Payment, Maintenance, Document } from "@/types";

export function useTenantPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!user) return;

      try {
        const data = await loadTenantData(user.id);
        
        setTenant(data.tenant);
        setProperty(data.property);
        setPayments(data.payments);
        setMaintenance(data.maintenance);
        setDocuments(data.documents);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tenant data:", error);
        setError(error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load tenant data. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchTenantData();
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return {
    tenant,
    property,
    payments,
    maintenance,
    documents,
    isLoading,
    error,
    formatDate,
    formatCurrency
  };
}
