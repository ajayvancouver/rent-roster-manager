
import { useState, useEffect } from "react";
import { Document, Tenant, Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { documentsService, tenantsService, propertiesService } from "@/services/supabaseService";

export function useDocuments() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Document["type"] | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managerId = profile?.id || user?.id;
        
        const [fetchedDocuments, fetchedTenants, fetchedProperties] = await Promise.all([
          documentsService.getAll(managerId),
          tenantsService.getAll(managerId),
          propertiesService.getAll(managerId)
        ]);
        
        console.log("Fetched documents:", fetchedDocuments);
        setDocuments(fetchedDocuments);
        setTenants(fetchedTenants);
        setProperties(fetchedProperties);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching documents data:", error);
        toast({
          title: "Error",
          description: "Failed to load documents data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, user, profile]);

  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return "Unassigned";
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return "Unassigned";
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  const getFilteredDocuments = () => {
    return documents.filter(document => {
      if (typeFilter !== "all" && document.type !== typeFilter) {
        return false;
      }
      
      const searchTerms = searchQuery.toLowerCase();
      const tenantName = document.tenantId ? getTenantName(document.tenantId).toLowerCase() : "";
      const propertyName = document.propertyId ? getPropertyName(document.propertyId).toLowerCase() : "";
      
      return (
        document.name.toLowerCase().includes(searchTerms) ||
        document.type.toLowerCase().includes(searchTerms) ||
        tenantName.includes(searchTerms) ||
        propertyName.includes(searchTerms)
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAddDocument = async (formData: Omit<Document, "id" | "uploadDate" | "tenantName" | "propertyName">) => {
    try {
      const managerId = profile?.id || user?.id;
      
      const documentData = {
        ...formData,
        managerId
      };
      
      const result = await documentsService.create(documentData);
      
      // Refresh documents data after adding new document
      const updatedDocuments = await documentsService.getAll(managerId);
      setDocuments(updatedDocuments);
      
      return true;
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Failed to add document",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    documents,
    filteredDocuments: getFilteredDocuments(),
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    getTenantName,
    getPropertyName,
    formatDate,
    handleAddDocument
  };
}
