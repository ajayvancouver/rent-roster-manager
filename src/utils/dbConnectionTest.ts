
import { supabase } from "@/integrations/supabase/client";
import { createSampleManager, createSampleTenant, logoutCurrentUser } from "@/services/sampleAccounts";

/**
 * Tests the connection to Supabase
 * @returns Connection status result
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Test a simple query to verify connection (not using aggregate functions)
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      throw error;
    }
    
    return {
      success: true,
      message: `Connection successful! Database is responsive.`
    };
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Diagnoses RLS policy issues
 */
export const diagnoseRLSIssues = async (): Promise<{ 
  success: boolean; 
  message: string;
  issues: string[];
  functionStatus?: {
    exists: boolean;
    name: string;
  }[];
}> => {
  const issues: string[] = [];
  const functionStatus: { exists: boolean; name: string }[] = [];
  
  try {
    // Check if our security definer functions exist
    const requiredFunctions = [
      'get_user_managed_properties',
      'is_property_manager',
      'is_tenant_of_managed_property'
    ];
    
    for (const funcName of requiredFunctions) {
      try {
        const { error } = await supabase.rpc(funcName);
        
        // Even if we get an error with parameters, the function exists
        // We're just checking if it's a "function doesn't exist" error or not
        const exists = !(error && error.message.includes('function') && error.message.includes('does not exist'));
        
        functionStatus.push({
          name: funcName,
          exists
        });
        
        if (!exists) {
          issues.push(`Missing security definer function: ${funcName}`);
        }
      } catch (err) {
        console.error(`Function check failed for ${funcName}:`, err);
        issues.push(`Error checking security definer function: ${funcName}`);
        functionStatus.push({
          name: funcName,
          exists: false
        });
      }
    }
    
    // If any security definer functions are missing, don't test further
    if (functionStatus.some(f => !f.exists)) {
      return {
        success: false,
        message: "Missing required security definer functions for RLS policies",
        issues,
        functionStatus
      };
    }
    
    // Now test that our RLS policies are working without recursion
    // Test simple queries to detect RLS recursion issues
    try {
      const { error } = await supabase
        .from('properties')
        .select('id, name')
        .limit(1);
        
      if (error) {
        console.error("Properties query error:", error);
        if (error.message.includes('recursion')) {
          issues.push("Properties table has recursive RLS policy");
        } else {
          issues.push(`Properties query error: ${error.message}`);
        }
      }
    } catch (err) {
      console.error("Properties test failed:", err);
      issues.push("Error testing properties table");
    }
    
    // Test tenant queries
    try {
      const { error } = await supabase
        .from('tenants')
        .select('id, name')
        .limit(1);
        
      if (error) {
        console.error("Tenants query error:", error);
        if (error.message.includes('recursion')) {
          issues.push("Tenants table has recursive RLS policy");
        } else {
          issues.push(`Tenants query error: ${error.message}`);
        }
      }
    } catch (err) {
      console.error("Tenants test failed:", err);
      issues.push("Error testing tenants table");
    }
    
    // Test maintenance queries
    try {
      const { error } = await supabase
        .from('maintenance')
        .select('id, title')
        .limit(1);
        
      if (error) {
        console.error("Maintenance query error:", error);
        if (error.message.includes('recursion')) {
          issues.push("Maintenance table has recursive RLS policy");
        } else {
          issues.push(`Maintenance query error: ${error.message}`);
        }
      }
    } catch (err) {
      console.error("Maintenance test failed:", err);
      issues.push("Error testing maintenance table");
    }
    
    return {
      success: issues.length === 0,
      message: issues.length === 0 
        ? "No RLS issues detected" 
        : "RLS policy issues found, check Supabase database",
      issues,
      functionStatus
    };
  } catch (error) {
    console.error("RLS diagnosis failed:", error);
    return {
      success: false,
      message: `Diagnosis failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      issues: [...issues, "Diagnosis failed with error"],
      functionStatus
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
      message: `Failed to create sample data: ${error instanceof Error ? error.message : JSON.stringify(error)}`
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
    
    // Test RLS policies
    const rlsResult = await diagnoseRLSIssues();
    results.rlsPolicies = {
      success: rlsResult.success,
      message: rlsResult.issues.length > 0 
        ? `RLS issues found: ${rlsResult.issues.join(', ')}`
        : "RLS policies working correctly"
    };
    
    // Test properties service with better error handling
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .limit(5);
      
      if (error) {
        console.error("Properties service error:", error);
        throw error;
      }
      
      results.properties = {
        success: true,
        message: `Properties service working. Found ${data?.length || 0} properties.`
      };
    } catch (error) {
      console.error("Properties service error full:", error);
      results.properties = {
        success: false,
        message: `Properties service error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      };
    }
    
    // Test tenants service with better error handling
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .limit(5);
      
      if (error) {
        console.error("Tenants service error:", error);
        throw error;
      }
      
      results.tenants = {
        success: true,
        message: `Tenants service working. Found ${data?.length || 0} tenants.`
      };
    } catch (error) {
      console.error("Tenants service error full:", error);
      results.tenants = {
        success: false,
        message: `Tenants service error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      };
    }
    
    // Test maintenance service with better error handling
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('id, title')
        .limit(5);
      
      if (error) {
        console.error("Maintenance service error:", error);
        throw error;
      }
      
      results.maintenance = {
        success: true,
        message: `Maintenance service working. Found ${data?.length || 0} maintenance requests.`
      };
    } catch (error) {
      console.error("Maintenance service error full:", error);
      results.maintenance = {
        success: false,
        message: `Maintenance service error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
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
      message: `Database test failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      details: results
    };
  }
};
