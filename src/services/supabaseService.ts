
import { supabase } from "@/integrations/supabase/client";
import { paymentsService } from "./paymentsService";
import { propertiesService } from "./propertiesService";
import { tenantsService } from "./tenantsService";
import { maintenanceService } from "./maintenanceService";
import { documentsService } from "./documents";

// Export all services from a single file
export {
  paymentsService,
  propertiesService,
  tenantsService,
  maintenanceService,
  documentsService
};

// Create a function to initialize all data at once
export async function loadAllData(managerId?: string) {
  try {
    console.log("Loading all data with managerId:", managerId);
    
    // Use Promise.allSettled to continue even if some requests fail
    const results = await Promise.allSettled([
      // Direct DB queries with specific column selection to avoid recursion
      supabase.from('properties').select('id, name, address, city, state, zip_code, units, type, image, manager_id'),
      supabase.from('tenants').select('id, name, email, phone, property_id, unit_number, lease_start, lease_end, rent_amount, deposit_amount, balance, status, tenant_user_id'),
      supabase.from('payments').select('id, tenant_id, amount, date, method, status, notes'),
      supabase.from('maintenance').select('id, property_id, tenant_id, title, description, priority, status, date_submitted, date_completed, assigned_to, cost'),
      supabase.from('documents').select('id, name, type, tenant_id, property_id, upload_date, file_size, file_type, url')
    ]);
    
    // Process results safely
    const propertiesResult = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
    const tenantsResult = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
    const paymentsResult = results[2].status === 'fulfilled' ? results[2].value.data || [] : [];
    const maintenanceResult = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];
    const documentsResult = results[4].status === 'fulfilled' ? results[4].value.data || [] : [];
    
    // Check for any errors to report
    const errors = results
      .filter(result => result.status === 'rejected')
      .map((result: any) => result.reason);
    
    if (errors.length > 0) {
      console.warn("Some data fetching operations failed:", errors);
    }
    
    // Transform data using utility functions
    const { transformProperties, transformTenants, transformPayments, transformMaintenance, transformDocuments } = await import("@/utils/transformData");
    
    const properties = transformProperties(propertiesResult);
    const tenants = transformTenants(tenantsResult, properties);
    const payments = transformPayments(paymentsResult, tenants);
    const maintenance = transformMaintenance(maintenanceResult, properties, tenants);
    const documents = transformDocuments(documentsResult, properties, tenants);
    
    console.log(`Data loaded: ${properties.length} properties, ${tenants.length} tenants`);
    
    return {
      properties,
      tenants,
      payments,
      maintenance,
      documents,
      isLoading: false,
      error: errors.length > 0 ? errors[0] : null
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      properties: [],
      tenants: [],
      payments: [],
      maintenance: [],
      documents: [],
      isLoading: false,
      error
    };
  }
}

export async function loadTenantData(userId: string) {
  try {
    // First get the tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*, properties(*)')
      .eq('tenant_user_id', userId)
      .single();
    
    if (tenantError) throw tenantError;
    
    if (!tenant) {
      return {
        tenant: null,
        property: null,
        payments: [],
        maintenance: [],
        documents: [],
        isLoading: false,
        error: null
      };
    }
    
    const [
      payments,
      maintenance,
      documents
    ] = await Promise.all([
      paymentsService.getByTenantId(tenant.id),
      maintenanceService.getByTenantId(tenant.id),
      documentsService.getByTenantId(tenant.id)
    ]);
    
    return {
      tenant,
      property: tenant.properties,
      payments,
      maintenance,
      documents,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error loading tenant data:", error);
    return {
      tenant: null,
      property: null,
      payments: [],
      maintenance: [],
      documents: [],
      isLoading: false,
      error
    };
  }
}

export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error getting current user profile:", error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
