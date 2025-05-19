import { supabase } from "@/integrations/supabase/client";

// Define allowed function names as a type
type SecurityDefinerFunction = 
  | "get_user_managed_properties" 
  | "is_property_manager" 
  | "is_tenant_of_managed_property"
  | "get_manager_properties"
  | "is_tenant_of_user_managed_property"
  | "is_user_property_manager";

// List of security definer functions that should exist
const requiredSecurityFunctions: SecurityDefinerFunction[] = [
  "get_user_managed_properties",
  "is_property_manager",
  "is_tenant_of_managed_property"
];

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Error testing database connection:", error);
      return { success: false, message: `Database connection test failed: ${error.message}` };
    }

    console.log("Database connection test successful");
    return { success: true, message: "Database connection test successful" };
  } catch (error) {
    console.error("Error testing database connection:", error);
    return { success: false, message: `Database connection test failed: ${error}` };
  }
};

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
    
    // Check if required security definer functions exist
    const functionStatus = await Promise.all(
      requiredSecurityFunctions.map(async (funcName: SecurityDefinerFunction) => {
        const { data, error } = await supabase.rpc(funcName);
        
        let exists = true;
        if (error && error.message.includes("does not exist")) {
          exists = false;
          issues.push(`Required security definer function "${funcName}" is missing`);
        }
        
        return { name: funcName, exists };
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

export const checkTablePermissions = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .limit(1);

    if (error) {
      console.error(`Error checking permissions for table ${tableName}:`, error);
      return { success: false, message: `Error checking permissions for table ${tableName}: ${error.message}` };
    }

    console.log(`Permissions check for table ${tableName} successful`);
    return { success: true, message: `Permissions check for table ${tableName} successful` };
  } catch (error) {
    console.error(`Error checking permissions for table ${tableName}:`, error);
    return { success: false, message: `Error checking permissions for table ${tableName}: ${error}` };
  }
};
