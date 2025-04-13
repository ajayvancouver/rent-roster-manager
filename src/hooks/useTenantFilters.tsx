
import { useState } from "react";
import { Tenant } from "@/types";

export function useTenantFilters(tenants: Tenant[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Tenant>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const getFilteredTenants = (propertyGetter?: (id: string) => string) => {
    return tenants.filter(tenant => {
      const searchTerms = searchQuery.toLowerCase();
      const propertyName = propertyGetter && tenant.propertyId 
        ? propertyGetter(tenant.propertyId).toLowerCase() 
        : (tenant.propertyName || "").toLowerCase();
        
      return (
        tenant.name.toLowerCase().includes(searchTerms) ||
        tenant.email.toLowerCase().includes(searchTerms) ||
        propertyName.includes(searchTerms)
      );
    });
  };

  const getSortedTenants = (filteredTenants: Tenant[]) => {
    return [...filteredTenants].sort((a, b) => {
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
  };

  const toggleSort = (field: keyof Tenant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    getFilteredTenants,
    getSortedTenants
  };
}
