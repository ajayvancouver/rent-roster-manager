
import { useState, useEffect } from "react";
import { Payment } from "@/types";
import { paymentsService, tenantsService, propertiesService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function usePayments() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Payment["status"] | "all">("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [sortField, setSortField] = useState<keyof Payment>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managerId = profile?.id || user?.id;
        
        console.log("Fetching payments data with managerId:", managerId);
        
        const [fetchedPayments, fetchedTenants, fetchedProperties] = await Promise.all([
          paymentsService.getAll(managerId),
          tenantsService.getAll(managerId),
          propertiesService.getAll(managerId)
        ]);
        
        console.log("Fetched payments:", fetchedPayments);
        console.log("Fetched tenants:", fetchedTenants);
        
        setPayments(fetchedPayments);
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching payments data:", error);
        toast({
          title: "Error",
          description: "Failed to load payments data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, user, profile]);

  // Get tenant name by ID
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  // Get property info for a tenant
  const getPropertyInfo = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return { name: null, unit: null };
    
    const property = properties.find(p => p.id === tenant.propertyId);
    return {
      name: property ? property.name : null,
      unit: tenant.unitNumber || null,
    };
  };

  // Filter payments
  const getFilteredPayments = () => {
    return payments.filter(payment => {
      // Apply status filter
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }
      
      // Apply date range filter
      if (dateRange.from && dateRange.to) {
        const paymentDate = new Date(payment.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        
        // Set time to beginning and end of day for proper comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        if (paymentDate < fromDate || paymentDate > toDate) {
          return false;
        }
      }
      
      // Apply search filter
      const searchTerms = searchQuery.toLowerCase();
      const tenantName = getTenantName(payment.tenantId).toLowerCase();
      const propertyInfo = getPropertyInfo(payment.tenantId);
      
      return (
        tenantName.includes(searchTerms) ||
        (propertyInfo.name && propertyInfo.name.toLowerCase().includes(searchTerms)) ||
        payment.method.toLowerCase().includes(searchTerms) ||
        payment.status.toLowerCase().includes(searchTerms) ||
        (payment.notes && payment.notes.toLowerCase().includes(searchTerms))
      );
    });
  };

  // Sort payments
  const getSortedPayments = () => {
    const filteredPayments = getFilteredPayments();
    
    return [...filteredPayments].sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === "amount") {
        return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });
  };

  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field as keyof Payment);
      setSortDirection("desc"); // Default to newest/highest first
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Add payment
  const handleAddPayment = async (formData: Omit<Payment, "id" | "tenantName" | "propertyId" | "propertyName" | "unitNumber">) => {
    try {
      const managerId = profile?.id || user?.id;
      
      // Ensure managerId is set
      const paymentData = {
        ...formData,
        managerId
      };
      
      console.log("Adding payment with data:", paymentData);
      
      const result = await paymentsService.create(paymentData);
      console.log("Payment created:", result);
      
      // Refresh payments data after adding new payment
      const updatedPayments = await paymentsService.getAll(managerId);
      console.log("Updated payments after adding:", updatedPayments);
      setPayments(updatedPayments);
      
      return true;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Failed to record payment",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Calculate payment stats
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = payments
    .filter(p => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    payments,
    tenants,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    sortField,
    sortDirection,
    toggleSort,
    getTenantName,
    getPropertyInfo,
    getSortedPayments,
    formatDate,
    getStatusColor,
    handleAddPayment,
    totalAmount,
    completedAmount,
    pendingAmount
  };
}
