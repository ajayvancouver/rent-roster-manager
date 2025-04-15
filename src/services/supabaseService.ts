
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
      propertiesService.getAll(managerId),
      tenantsService.getAll(managerId),
      paymentsService.getAll(managerId),
      maintenanceService.getAll(managerId),
      documentsService.getAll(managerId).catch(err => {
        console.error("Error fetching documents:", err);
        return []; // Return empty array on error
      })
    ]);
    
    // Extract the results, providing empty arrays for any rejected promises
    const [
      propertiesResult,
      tenantsResult, 
      paymentsResult, 
      maintenanceResult, 
      documentsResult
    ] = results;
    
    const properties = propertiesResult.status === 'fulfilled' ? propertiesResult.value : [];
    const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
    const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value : [];
    const maintenance = maintenanceResult.status === 'fulfilled' ? maintenanceResult.value : [];
    const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
    
    console.log(`Data loaded: ${properties.length} properties, ${tenants.length} tenants`);
    
    return {
      properties,
      tenants,
      payments,
      maintenance,
      documents,
      isLoading: false,
      error: null
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
