
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";
import { getDashboardStats } from "@/utils/dataUtils";
import { useAuth } from "@/hooks/useAuth";

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
      if (!user) {
        setIsLoading(false);
        setError("You must be logged in to view this data");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Authenticated user ID:", user.id);
        console.log("User type:", userType);
        console.log("Profile:", profile);
        
        // Fetch properties (RLS will filter to only show properties managed by the current user)
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*');
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw propertiesError;
        }
        
        console.log("Properties fetched:", propertiesData?.length || 0);
        
        // Transform property data to match our application model
        const transformedProperties = (propertiesData || []).map(property => ({
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zip_code,
          units: property.units,
          type: property.type as 'apartment' | 'house' | 'duplex' | 'commercial',
          image: property.image,
          managerId: property.manager_id
        }));
        
        setProperties(transformedProperties);
        
        // Fetch tenants (RLS will filter based on property management)
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*');
        
        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw tenantsError;
        }
        
        console.log("Tenants fetched:", tenantsData?.length || 0);
        
        // Transform tenant data to match our application model
        const transformedTenants = (tenantsData || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone || '',
          propertyId: tenant.property_id || '',
          propertyName: null, // We'll get this from the property data later
          propertyAddress: null, // We'll get this from the property data later
          unitNumber: tenant.unit_number || '',
          leaseStart: tenant.lease_start,
          leaseEnd: tenant.lease_end,
          rentAmount: tenant.rent_amount,
          depositAmount: tenant.deposit_amount,
          balance: tenant.balance || 0,
          status: tenant.status as 'active' | 'inactive' | 'pending',
          userId: tenant.tenant_user_id,
          managerId: null // We'll get this from the property
        }));
        
        // Add property information to tenants
        const enrichedTenants = transformedTenants.map(tenant => {
          const tenantProperty = transformedProperties.find(p => p.id === tenant.propertyId);
          if (tenantProperty) {
            return {
              ...tenant,
              propertyName: tenantProperty.name,
              propertyAddress: `${tenantProperty.address}, ${tenantProperty.city}, ${tenantProperty.state} ${tenantProperty.zipCode}`,
              managerId: tenantProperty.managerId
            };
          }
          return tenant;
        });
        
        setTenants(enrichedTenants);
        
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          throw paymentsError;
        }
        
        console.log("Payments fetched:", paymentsData?.length || 0);
        
        // Transform payments data to match our application model
        const transformedPayments = (paymentsData || []).map(payment => ({
          id: payment.id,
          tenantId: payment.tenant_id,
          tenantName: enrichedTenants.find(t => t.id === payment.tenant_id)?.name,
          propertyId: enrichedTenants.find(t => t.id === payment.tenant_id)?.propertyId,
          propertyName: enrichedTenants.find(t => t.id === payment.tenant_id)?.propertyName,
          unitNumber: enrichedTenants.find(t => t.id === payment.tenant_id)?.unitNumber,
          amount: payment.amount,
          date: payment.date,
          method: payment.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
          status: payment.status as 'pending' | 'completed' | 'failed',
          notes: payment.notes,
          managerId: enrichedTenants.find(t => t.id === payment.tenant_id)?.managerId
        }));
        
        setPayments(transformedPayments);
        
        // Fetch maintenance requests
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('*');
        
        if (maintenanceError) {
          console.error("Error fetching maintenance requests:", maintenanceError);
          throw maintenanceError;
        }
        
        console.log("Maintenance requests fetched:", maintenanceData?.length || 0);
        
        // Transform maintenance data to match our application model
        const transformedMaintenance = (maintenanceData || []).map(request => ({
          id: request.id,
          propertyId: request.property_id,
          propertyName: transformedProperties.find(p => p.id === request.property_id)?.name,
          tenantId: request.tenant_id,
          tenantName: enrichedTenants.find(t => t.id === request.tenant_id)?.name,
          tenantEmail: enrichedTenants.find(t => t.id === request.tenant_id)?.email,
          unitNumber: enrichedTenants.find(t => t.id === request.tenant_id)?.unitNumber,
          title: request.title,
          description: request.description,
          priority: request.priority as 'low' | 'medium' | 'high' | 'emergency',
          status: request.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
          dateSubmitted: request.date_submitted,
          dateCompleted: request.date_completed,
          assignedTo: request.assigned_to,
          cost: request.cost,
          managerId: transformedProperties.find(p => p.id === request.property_id)?.managerId
        }));
        
        setMaintenance(transformedMaintenance);
        
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*');
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          throw documentsError;
        }
        
        console.log("Documents fetched:", documentsData?.length || 0);
        
        // Transform documents data to match our application model
        const transformedDocuments = (documentsData || []).map(document => ({
          id: document.id,
          name: document.name,
          type: document.type as 'lease' | 'payment' | 'maintenance' | 'other',
          tenantId: document.tenant_id,
          tenantName: enrichedTenants.find(t => t.id === document.tenant_id)?.name,
          propertyId: document.property_id,
          propertyName: transformedProperties.find(p => p.id === document.property_id)?.name,
          uploadDate: document.upload_date,
          fileSize: document.file_size,
          fileType: document.file_type,
          url: document.url,
          managerId: transformedProperties.find(p => p.id === document.property_id)?.managerId || 
                   enrichedTenants.find(t => t.id === document.tenant_id)?.managerId
        }));
        
        setDocuments(transformedDocuments);
        
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
