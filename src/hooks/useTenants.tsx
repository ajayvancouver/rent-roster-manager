
import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { tenantsService, propertiesService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

export function useTenants() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Tenant>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedTenants, fetchedProperties] = await Promise.all([
          tenantsService.getAll(),
          propertiesService.getAll()
        ]);
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tenants and properties",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown Property";
  };

  const filteredTenants = tenants.filter(tenant => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(searchTerms) ||
      tenant.email.toLowerCase().includes(searchTerms) ||
      getPropertyName(tenant.propertyId).toLowerCase().includes(searchTerms)
    );
  });

  const sortedTenants = [...filteredTenants].sort((a, b) => {
    if (sortField === "name" || sortField === "email") {
      return sortDirection === "asc"
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    } else if (sortField === "rentAmount" || sortField === "balance") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else if (sortField === "leaseEnd") {
      return sortDirection === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }
    return 0;
  });

  const toggleSort = (field: keyof Tenant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddTenant = async (tenantData: Omit<Tenant, "id">) => {
    try {
      const { data, error } = await tenantsService.create(tenantData);
      
      if (error) {
        console.error("Error creating tenant:", error);
        toast({
          title: "Error",
          description: "Failed to add tenant: " + error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data) {
        // Map the returned data to a Tenant object, similar to what tenantsService.getById does
        const newTenant: Tenant = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          propertyId: data.property_id || '',
          unitNumber: data.unit_number || '',
          leaseStart: data.lease_start,
          leaseEnd: data.lease_end,
          rentAmount: data.rent_amount,
          depositAmount: data.deposit_amount,
          balance: data.balance || 0,
          status: data.status as 'active' | 'inactive' | 'pending'
        };
        
        setTenants([...tenants, newTenant]);
        
        toast({
          title: "Success",
          description: "Tenant has been added successfully."
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error adding tenant:", error);
      toast({
        title: "Error",
        description: "Failed to add tenant: " + (error.message || "Please try again later."),
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    tenants,
    properties,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    getPropertyName,
    toggleSort,
    handleAddTenant,
    sortedTenants,
    activeTenants: sortedTenants.filter(t => t.status === "active"),
    inactiveTenants: sortedTenants.filter(t => t.status !== "active")
  };
}
