
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
        
        // We'll use a very minimal select statement to avoid complex joins that could trigger recursion
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, address, city, state, zip_code, units, type, image, manager_id')
          .order('name');
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw new Error(`Properties error: ${propertiesError.message}`);
        }
        
        console.log("Properties fetched:", propertiesData?.length || 0);
        
        // Transform property data to match our application model with camelCase keys
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
        
        // Fetch tenants with explicit column selection
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, name, email, phone, property_id, unit_number, lease_start, lease_end, rent_amount, deposit_amount, balance, status, tenant_user_id')
          .order('name');
        
        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error(`Tenants error: ${tenantsError.message}`);
        }
        
        console.log("Tenants fetched:", tenantsData?.length || 0);
        
        // Transform tenant data with property lookups
        const transformedTenants = (tenantsData || []).map(tenant => {
          const propertyInfo = transformedProperties.find(p => p.id === tenant.property_id);
          
          return {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone || '',
            propertyId: tenant.property_id || '',
            propertyName: propertyInfo?.name || null,
            propertyAddress: propertyInfo ? `${propertyInfo.address}, ${propertyInfo.city}, ${propertyInfo.state} ${propertyInfo.zipCode}` : null,
            unitNumber: tenant.unit_number || '',
            leaseStart: tenant.lease_start,
            leaseEnd: tenant.lease_end,
            rentAmount: tenant.rent_amount,
            depositAmount: tenant.deposit_amount,
            balance: tenant.balance || 0,
            status: tenant.status as 'active' | 'inactive' | 'pending',
            userId: tenant.tenant_user_id,
            managerId: propertyInfo?.managerId || null
          };
        });
        
        setTenants(transformedTenants);
        
        // Fetch payments with explicit column selection
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('id, tenant_id, amount, date, method, status, notes')
          .order('date', { ascending: false });
        
        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          throw new Error(`Payments error: ${paymentsError.message}`);
        }
        
        console.log("Payments fetched:", paymentsData?.length || 0);
        
        // Transform payments data with tenant lookups
        const transformedPayments = (paymentsData || []).map(payment => {
          const tenant = transformedTenants.find(t => t.id === payment.tenant_id);
          
          return {
            id: payment.id,
            tenantId: payment.tenant_id,
            tenantName: tenant?.name || null,
            propertyId: tenant?.propertyId || null,
            propertyName: tenant?.propertyName || null,
            unitNumber: tenant?.unitNumber || '',
            amount: payment.amount,
            date: payment.date,
            method: payment.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
            status: payment.status as 'pending' | 'completed' | 'failed',
            notes: payment.notes || '',
            managerId: tenant?.managerId || null
          };
        });
        
        setPayments(transformedPayments);
        
        // Fetch maintenance requests with explicit column selection
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('id, property_id, tenant_id, title, description, priority, status, date_submitted, date_completed, assigned_to, cost')
          .order('date_submitted', { ascending: false });
        
        if (maintenanceError) {
          console.error("Error fetching maintenance requests:", maintenanceError);
          throw new Error(`Maintenance error: ${maintenanceError.message}`);
        }
        
        console.log("Maintenance requests fetched:", maintenanceData?.length || 0);
        
        // Transform maintenance data with property and tenant lookups
        const transformedMaintenance = (maintenanceData || []).map(request => {
          const property = transformedProperties.find(p => p.id === request.property_id);
          const tenant = transformedTenants.find(t => t.id === request.tenant_id);
          
          return {
            id: request.id,
            propertyId: request.property_id,
            propertyName: property?.name || null,
            tenantId: request.tenant_id,
            tenantName: tenant?.name || null,
            tenantEmail: tenant?.email || null,
            unitNumber: tenant?.unitNumber || null,
            title: request.title,
            description: request.description,
            priority: request.priority as 'low' | 'medium' | 'high' | 'emergency',
            status: request.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
            dateSubmitted: request.date_submitted,
            dateCompleted: request.date_completed,
            assignedTo: request.assigned_to,
            cost: request.cost,
            managerId: property?.managerId || null
          };
        });
        
        setMaintenance(transformedMaintenance);
        
        // Fetch documents with explicit column selection
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id, name, type, tenant_id, property_id, upload_date, file_size, file_type, url')
          .order('upload_date', { ascending: false });
        
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          throw new Error(`Documents error: ${documentsError.message}`);
        }
        
        console.log("Documents fetched:", documentsData?.length || 0);
        
        // Transform documents data with property and tenant lookups
        const transformedDocuments = (documentsData || []).map(document => {
          const property = transformedProperties.find(p => p.id === document.property_id);
          const tenant = transformedTenants.find(t => t.id === document.tenant_id);
          
          return {
            id: document.id,
            name: document.name,
            type: document.type as 'lease' | 'payment' | 'maintenance' | 'other',
            tenantId: document.tenant_id,
            tenantName: tenant?.name || null,
            propertyId: document.property_id,
            propertyName: property?.name || null,
            uploadDate: document.upload_date,
            fileSize: document.file_size,
            fileType: document.file_type,
            url: document.url,
            managerId: property?.managerId || tenant?.managerId || null
          };
        });
        
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
