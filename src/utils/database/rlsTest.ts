
import { supabase } from "@/integrations/supabase/client";

// Define allowed function names as a type
export type SecurityDefinerFunction = 
  | "get_user_managed_properties" 
  | "is_property_manager" 
  | "is_tenant_of_managed_property"
  | "get_manager_properties"
  | "is_tenant_of_user_managed_property"
  | "is_user_property_manager"
  | "get_user_managed_property_ids";

// List of security definer functions that should exist
export const requiredSecurityFunctions: SecurityDefinerFunction[] = [
  "get_user_managed_properties",
  "is_property_manager",
  "is_tenant_of_managed_property",
  "get_manager_properties",
  "is_tenant_of_user_managed_property",
  "is_user_property_manager",
  "get_user_managed_property_ids"
];

/**
 * Diagnoses issues with Row Level Security policies
 */
export const diagnoseRLSIssues = async () => {
  try {
    console.log("Diagnosing RLS issues...");
    
    // Test connection to tables with RLS
    const tablesWithIssues: string[] = [];
    const issues: string[] = [];
    
    // Check properties table
    const { data: propertiesData, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .limit(1);
      
    if (propertiesError) {
      if (propertiesError.message.includes("recursion")) {
        tablesWithIssues.push("properties");
        issues.push("Properties table has recursive RLS policy");
      }
    }
    
    // Check tenants table
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id")
      .limit(1);
      
    if (tenantsError) {
      if (tenantsError.message.includes("recursion")) {
        tablesWithIssues.push("tenants");
        issues.push("Tenants table has recursive RLS policy");
      }
    }
    
    // Check maintenance table
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from("maintenance")
      .select("id")
      .limit(1);
      
    if (maintenanceError) {
      if (maintenanceError.message.includes("recursion")) {
        tablesWithIssues.push("maintenance");
        issues.push("Maintenance table has recursive RLS policy");
      }
    }
    
    // Query to check if search_path is set for each function
    const searchPathQuery = `
      SELECT 
        routine_name, 
        (SELECT option_value
         FROM pg_options_to_table(proconfig)
         WHERE option_name = 'search_path') as search_path
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND routine_name = any($1::text[])
    `;
    
    // Get search_path information for functions
    const { data: searchPathData, error: searchPathError } = await supabase.rpc(
      'admin_query', 
      { sql_query: searchPathQuery, params: [requiredSecurityFunctions] }
    );
    
    const searchPathMap = new Map();
    if (searchPathData && !searchPathError) {
      searchPathData.forEach((row: any) => {
        searchPathMap.set(row.routine_name, !!row.search_path);
      });
    } else if (searchPathError) {
      console.log("Error getting search_path info:", searchPathError);
    }
    
    // Check if required security definer functions exist
    const functionStatus = await Promise.all(
      requiredSecurityFunctions.map(async (funcName: SecurityDefinerFunction) => {
        // We need to try to invoke the function, but it may require parameters
        // So we'll use a general approach to detect if it exists
        let exists = true;
        let error = null;
        
        try {
          // Different approach based on function name
          if (funcName === "get_user_managed_properties" || 
              funcName === "get_manager_properties" || 
              funcName === "get_user_managed_property_ids") {
            // Functions that don't require parameters
            const result = await supabase.rpc(funcName);
            error = result.error;
          } else if (funcName.startsWith("is_property_manager")) {
            // Try with a dummy UUID parameter
            const result = await supabase.rpc(funcName, { property_id: '00000000-0000-0000-0000-000000000000' });
            error = result.error;
          } else if (funcName.startsWith("is_tenant")) {
            // Try with a dummy UUID parameter
            const result = await supabase.rpc(funcName, { tenant_id: '00000000-0000-0000-0000-000000000000' });
            error = result.error;
          } else {
            // For other functions, just check if they exist without parameters
            const result = await supabase.rpc(funcName);
            error = result.error;
          }
          
          // If we get an error about parameters or permissions, the function exists
          // If we get an error about the function not existing, it doesn't exist
          if (error && error.message.includes("does not exist")) {
            exists = false;
            issues.push(`Required security definer function "${funcName}" is missing`);
          }
        } catch (e) {
          // This probably means the function doesn't exist
          exists = false;
          issues.push(`Required security definer function "${funcName}" couldn't be called`);
        }
        
        // Check if the function has search_path set
        const hasSearchPath = searchPathMap.get(funcName) || false;
        if (exists && !hasSearchPath) {
          issues.push(`Function "${funcName}" doesn't have search_path set to public`);
        }
        
        return { 
          name: funcName, 
          exists,
          hasSearchPath
        };
      })
    );
    
    const success = issues.length === 0;
    const message = success
      ? "RLS policies appear to be correctly configured"
      : `Found ${issues.length} issues with RLS configuration`;
      
    return {
      success,
      message,
      issues,
      functionStatus
    };
  } catch (error) {
    console.error("Error diagnosing RLS:", error);
    return {
      success: false,
      message: `Error during RLS diagnosis: ${error instanceof Error ? error.message : "Unknown error"}`,
      issues: [`Diagnosis error: ${error instanceof Error ? error.message : "Unknown error"}`]
    };
  }
};
