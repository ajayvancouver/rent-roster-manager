
import { supabase } from "@/integrations/supabase/client";
import { createSampleManager, createSampleTenant, logoutCurrentUser } from "@/services/sampleAccounts";
import { toast } from "@/components/ui/use-toast";

/**
 * Tests the connection to Supabase
 * @returns Connection status result
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Test a simple query to verify connection
    const { data, error } = await supabase
      .from('properties')
      .select('count()')
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      message: `Connection successful! Found ${data?.count || 0} properties.`
    };
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Creates sample data in the database
 * @returns Result with manager and tenant credentials
 */
export const createAndTestSampleData = async (): Promise<{ 
  success: boolean; 
  message: string;
  managerCredentials?: { email: string; password: string };
  tenantCredentials?: { email: string; password: string };
}> => {
  try {
    // Ensure we're logged out first
    await logoutCurrentUser();
    
    // Create a sample manager (which also creates properties)
    const managerCredentials = await createSampleManager();
    
    // Create a sample tenant
    const tenantCredentials = await createSampleTenant();
    
    return {
      success: true,
      message: "Successfully created sample manager and tenant accounts with properties",
      managerCredentials,
      tenantCredentials
    };
  } catch (error) {
    console.error("Failed to create sample data:", error);
    return {
      success: false,
      message: `Failed to create sample data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Tests that all services are working correctly
 */
export const runFullDatabaseTest = async (): Promise<{ 
  success: boolean; 
  message: string;
  details: Record<string, { success: boolean; message: string }>;
}> => {
  const results: Record<string, { success: boolean; message: string }> = {};
  
  try {
    // Test basic connection
    results.connection = await testSupabaseConnection();
    
    // Test properties service
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      results.properties = {
        success: true,
        message: `Properties service working. Sample: ${data.length > 0 ? data[0].name : 'No properties found'}`
      };
    } catch (error) {
      results.properties = {
        success: false,
        message: `Properties service error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    
    // Test tenants service
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      results.tenants = {
        success: true,
        message: `Tenants service working. Sample: ${data.length > 0 ? data[0].name : 'No tenants found'}`
      };
    } catch (error) {
      results.tenants = {
        success: false,
        message: `Tenants service error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    
    // Test maintenance service
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      results.maintenance = {
        success: true,
        message: `Maintenance service working. Sample: ${data.length > 0 ? data[0].title : 'No maintenance requests found'}`
      };
    } catch (error) {
      results.maintenance = {
        success: false,
        message: `Maintenance service error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    
    // Determine overall success
    const allSuccessful = Object.values(results).every(result => result.success);
    
    return {
      success: allSuccessful,
      message: allSuccessful 
        ? "All database connections are working correctly" 
        : "Some database connections failed",
      details: results
    };
  } catch (error) {
    console.error("Database test failed:", error);
    return {
      success: false,
      message: `Database test failed: ${error instanceof Error ? error.message : String(error)}`,
      details: results
    };
  }
};
